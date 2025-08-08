#!/usr/bin/env node
/**
 * RFID Tag Assignment System for Clinic Inventory Management System (CIMS)
 * Node.js version using Mongoose with MongoDB
 * Generates unique RFID tags and assigns them to medical supplies
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cims';

// Medical Supply Schema
const medicalSupplySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  current_stock: { type: Number, required: true },
  threshold_quantity: { type: Number, required: true },
  expiry_date: { type: Date },
  supplier_id: { type: String, required: true },
  supplier_name: { type: String, required: true },
  unit: { type: String, default: 'units' },
  rfid_tag: { type: String, unique: true, sparse: true }, // RFID tag field
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// RFID Tag Schema
const rfidTagSchema = new mongoose.Schema({
  tag_id: { type: String, required: true, unique: true },
  item_id: { type: String, required: true },
  item_name: { type: String, required: true },
  generated_at: { type: Date, default: Date.now },
  checksum: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'lost', 'damaged'], default: 'active' }
});

// Models
const MedicalSupply = mongoose.model('MedicalSupply', medicalSupplySchema);
const RFIDTag = mongoose.model('RFIDTag', rfidTagSchema);

class RFIDAssignmentService {
  constructor() {
    this.rfidTags = new Map();
  }

  /**
   * Generate a globally unique RFID tag string
   * Format: RFID-{item_id}-{timestamp}-{uuid_short}
   * Example: RFID-ms_001-20241201T143022Z-a1b2c3d4
   */
  generateRFIDTag(itemId, itemName) {
    try {
      // Create timestamp in ISO format
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      // Generate a short UUID (first 8 characters)
      const uuidShort = uuidv4().substring(0, 8);
      
      // Create the RFID tag
      const rfidTag = `RFID-${itemId}-${timestamp}-${uuidShort}`;
      
      // Generate checksum for integrity
      const checksum = crypto.createHash('md5').update(rfidTag).digest('hex').substring(0, 8);
      
      return {
        tag_id: rfidTag,
        item_id: itemId,
        item_name: itemName,
        generated_at: new Date(),
        checksum: checksum,
        status: 'active'
      };
    } catch (error) {
      console.error(`Failed to generate RFID tag for ${itemId}:`, error);
      throw error;
    }
  }

  /**
   * Check if RFID tag is unique
   */
  async isRFIDTagUnique(rfidTag) {
    try {
      const existingTag = await RFIDTag.findOne({ tag_id: rfidTag });
      return !existingTag;
    } catch (error) {
      console.error('Error checking RFID tag uniqueness:', error);
      throw error;
    }
  }

  /**
   * Get all medical supplies that don't have RFID tags
   */
  async getSuppliesWithoutRFID() {
    try {
      const supplies = await MedicalSupply.find({ rfid_tag: { $exists: false } });
      return supplies;
    } catch (error) {
      console.error('Error getting supplies without RFID:', error);
      throw error;
    }
  }

  /**
   * Assign RFID tags to all medical supplies that don't have them
   */
  async assignRFIDTags(dryRun = false) {
    try {
      const suppliesWithoutRFID = await this.getSuppliesWithoutRFID();
      
      if (suppliesWithoutRFID.length === 0) {
        console.log('All medical supplies already have RFID tags assigned');
        return {
          status: 'success',
          message: 'All medical supplies already have RFID tags',
          assigned_count: 0,
          total_supplies: await MedicalSupply.countDocuments(),
          supplies_without_rfid: 0
        };
      }

      console.log(`Found ${suppliesWithoutRFID.length} supplies without RFID tags`);
      
      const assignedTags = [];
      const failedAssignments = [];

      for (const supply of suppliesWithoutRFID) {
        try {
          const rfidTagObj = this.generateRFIDTag(supply.id, supply.name);
          
          // Check if tag is unique
          const isUnique = await this.isRFIDTagUnique(rfidTagObj.tag_id);
          if (!isUnique) {
            throw new Error('RFID tag already exists');
          }

          if (!dryRun) {
            // Save RFID tag to database
            const rfidTag = new RFIDTag(rfidTagObj);
            await rfidTag.save();

            // Update medical supply with RFID tag
            await MedicalSupply.findByIdAndUpdate(
              supply._id,
              { 
                rfid_tag: rfidTagObj.tag_id,
                updated_at: new Date()
              }
            );

            assignedTags.push({
              item_id: supply.id,
              item_name: supply.name,
              rfid_tag: rfidTagObj.tag_id,
              assigned_at: new Date().toISOString()
            });
          }

          console.log(`Assigned RFID tag ${rfidTagObj.tag_id} to ${supply.name}`);
          
        } catch (error) {
          console.error(`Failed to assign RFID tag to ${supply.name}:`, error);
          failedAssignments.push({
            item_id: supply.id,
            item_name: supply.name,
            error: error.message
          });
        }
      }

      return {
        status: 'success',
        message: 'RFID assignment completed',
        assigned_count: assignedTags.length,
        failed_count: failedAssignments.length,
        total_supplies: await MedicalSupply.countDocuments(),
        supplies_without_rfid: suppliesWithoutRFID.length,
        assigned_tags: assignedTags,
        failed_assignments: failedAssignments,
        dry_run: dryRun
      };
      
    } catch (error) {
      console.error('RFID assignment failed:', error);
      return {
        status: 'error',
        message: `RFID assignment failed: ${error.message}`,
        assigned_count: 0,
        failed_count: 0,
        total_supplies: 0,
        supplies_without_rfid: 0
      };
    }
  }

  /**
   * Get RFID assignment statistics
   */
  async getRFIDStatistics() {
    try {
      const totalSupplies = await MedicalSupply.countDocuments();
      const suppliesWithRFID = await MedicalSupply.countDocuments({ rfid_tag: { $exists: true } });
      const suppliesWithoutRFID = totalSupplies - suppliesWithRFID;
      const totalRfidTags = await RFIDTag.countDocuments();
      const activeRfidTags = await RFIDTag.countDocuments({ status: 'active' });
      const inactiveRfidTags = totalRfidTags - activeRfidTags;

      return {
        total_supplies: totalSupplies,
        supplies_with_rfid: suppliesWithRFID,
        supplies_without_rfid: suppliesWithoutRFID,
        rfid_coverage_percentage: totalSupplies > 0 ? (suppliesWithRFID / totalSupplies * 100) : 0,
        total_rfid_tags: totalRfidTags,
        active_rfid_tags: activeRfidTags,
        inactive_rfid_tags: inactiveRfidTags
      };
    } catch (error) {
      console.error('Error getting RFID statistics:', error);
      throw error;
    }
  }

  /**
   * Validate all RFID tags for integrity
   */
  async validateRFIDTags() {
    try {
      const rfidTags = await RFIDTag.find();
      const validationResults = {
        total_tags: rfidTags.length,
        valid_tags: 0,
        invalid_tags: 0,
        errors: []
      };

      for (const tag of rfidTags) {
        try {
          // Validate checksum
          const expectedChecksum = crypto.createHash('md5').update(tag.tag_id).digest('hex').substring(0, 8);
          if (tag.checksum !== expectedChecksum) {
            validationResults.invalid_tags++;
            validationResults.errors.push({
              tag_id: tag.tag_id,
              error: 'Checksum mismatch',
              expected: expectedChecksum,
              actual: tag.checksum
            });
          } else {
            validationResults.valid_tags++;
          }
        } catch (error) {
          validationResults.invalid_tags++;
          validationResults.errors.push({
            tag_id: tag.tag_id,
            error: error.message
          });
        }
      }

      return validationResults;
    } catch (error) {
      console.error('Error validating RFID tags:', error);
      throw error;
    }
  }

  /**
   * Export RFID assignment report to JSON file
   */
  async exportRFIDReport(filename = 'rfid_report.json') {
    try {
      const statistics = await this.getRFIDStatistics();
      const validation = await this.validateRFIDTags();
      const rfidTags = await RFIDTag.find();
      const suppliesWithoutRFID = await this.getSuppliesWithoutRFID();

      const report = {
        generated_at: new Date().toISOString(),
        statistics,
        validation,
        rfid_tags: rfidTags.map(tag => tag.toObject()),
        supplies_without_rfid: suppliesWithoutRFID.map(supply => ({
          id: supply.id,
          name: supply.name,
          current_stock: supply.current_stock,
          supplier: supply.supplier_name
        }))
      };

      await fs.writeFile(filename, JSON.stringify(report, null, 2));
      console.log(`RFID report exported to ${filename}`);
      return filename;
    } catch (error) {
      console.error('Failed to export RFID report:', error);
      throw error;
    }
  }
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const showStats = args.includes('--statistics');
  const validate = args.includes('--validate');
  const exportReport = args.includes('--export-report');
  const reportFilename = args.find(arg => arg.startsWith('--report-filename='))?.split('=')[1] || 'rfid_report.json';

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    const rfidService = new RFIDAssignmentService();

    if (showStats) {
      // Show statistics
      const stats = await rfidService.getRFIDStatistics();
      console.log('\n=== RFID Assignment Statistics ===');
      console.log(`Total Supplies: ${stats.total_supplies}`);
      console.log(`Supplies with RFID: ${stats.supplies_with_rfid}`);
      console.log(`Supplies without RFID: ${stats.supplies_without_rfid}`);
      console.log(`RFID Coverage: ${stats.rfid_coverage_percentage.toFixed(1)}%`);
      console.log(`Total RFID Tags: ${stats.total_rfid_tags}`);
      console.log(`Active RFID Tags: ${stats.active_rfid_tags}`);
      console.log(`Inactive RFID Tags: ${stats.inactive_rfid_tags}`);
    } else if (validate) {
      // Validate RFID tags
      const validation = await rfidService.validateRFIDTags();
      console.log('\n=== RFID Tag Validation ===');
      console.log(`Total Tags: ${validation.total_tags}`);
      console.log(`Valid Tags: ${validation.valid_tags}`);
      console.log(`Invalid Tags: ${validation.invalid_tags}`);
      
      if (validation.errors.length > 0) {
        console.log('\nErrors:');
        validation.errors.forEach(error => {
          console.log(`  - ${error.tag_id}: ${error.error}`);
        });
      }
    } else if (exportReport) {
      // Export report
      const filename = await rfidService.exportRFIDReport(reportFilename);
      console.log(`\nRFID report exported to: ${filename}`);
    } else {
      // Assign RFID tags
      console.log(`\n${dryRun ? 'DRY RUN MODE' : 'LIVE MODE'}`);
      console.log('='.repeat(50));
      
      const result = await rfidService.assignRFIDTags(dryRun);
      
      console.log('\n=== RFID Assignment Results ===');
      console.log(`Status: ${result.status}`);
      console.log(`Message: ${result.message}`);
      console.log(`Assigned: ${result.assigned_count}`);
      console.log(`Failed: ${result.failed_count}`);
      console.log(`Total Supplies: ${result.total_supplies}`);
      console.log(`Supplies without RFID: ${result.supplies_without_rfid}`);
      
      if (result.assigned_tags && result.assigned_tags.length > 0) {
        console.log('\nAssigned RFID Tags:');
        result.assigned_tags.forEach(assignment => {
          console.log(`  - ${assignment.item_name}: ${assignment.rfid_tag}`);
        });
      }
      
      if (result.failed_assignments && result.failed_assignments.length > 0) {
        console.log('\nFailed Assignments:');
        result.failed_assignments.forEach(failure => {
          console.log(`  - ${failure.item_name}: ${failure.error}`);
        });
      }
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('CLI execution failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RFIDAssignmentService, MedicalSupply, RFIDTag };

