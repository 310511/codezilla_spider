#!/usr/bin/env python3
"""
RFID Tag Assignment System for Clinic Inventory Management System (CIMS)
Generates unique RFID tags and assigns them to medical supplies
"""

import sys
import os
import uuid
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import json
import argparse
import logging
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.alerts_service import AlertsService, MedicalSupply
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('rfid_assignment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class RFIDTag(BaseModel):
    """RFID Tag model"""
    tag_id: str
    item_id: str
    item_name: str
    generated_at: datetime
    checksum: str
    status: str = "active"  # active, inactive, lost, damaged

class RFIDAssignmentService:
    """Service for managing RFID tag assignments"""
    
    def __init__(self):
        self.alerts_service = AlertsService()
        self.rfid_tags: Dict[str, RFIDTag] = {}
        self._load_existing_rfid_tags()
    
    def _load_existing_rfid_tags(self):
        """Load existing RFID tags from storage"""
        try:
            rfid_file = Path("rfid_tags.json")
            if rfid_file.exists():
                with open(rfid_file, 'r') as f:
                    data = json.load(f)
                    for tag_data in data:
                        tag = RFIDTag(**tag_data)
                        self.rfid_tags[tag.tag_id] = tag
                logger.info(f"Loaded {len(self.rfid_tags)} existing RFID tags")
        except Exception as e:
            logger.warning(f"Could not load existing RFID tags: {e}")
    
    def _save_rfid_tags(self):
        """Save RFID tags to storage"""
        try:
            rfid_file = Path("rfid_tags.json")
            data = [tag.dict() for tag in self.rfid_tags.values()]
            with open(rfid_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            logger.info(f"Saved {len(self.rfid_tags)} RFID tags to storage")
        except Exception as e:
            logger.error(f"Failed to save RFID tags: {e}")
            raise
    
    def generate_rfid_tag(self, item_id: str, item_name: str) -> str:
        """
        Generate a globally unique RFID tag string
        
        Format: RFID-{item_id}-{timestamp}-{uuid_short}
        Example: RFID-ms_001-20241201T143022Z-a1b2c3d4
        """
        try:
            # Create timestamp in ISO format
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
            
            # Generate a short UUID (first 8 characters)
            uuid_short = str(uuid.uuid4())[:8]
            
            # Create the RFID tag
            rfid_tag = f"RFID-{item_id}-{timestamp}-{uuid_short}"
            
            # Generate checksum for integrity
            checksum = hashlib.md5(rfid_tag.encode()).hexdigest()[:8]
            
            # Create RFID tag object
            rfid_obj = RFIDTag(
                tag_id=rfid_tag,
                item_id=item_id,
                item_name=item_name,
                generated_at=datetime.now(timezone.utc),
                checksum=checksum
            )
            
            # Store the RFID tag
            self.rfid_tags[rfid_tag] = rfid_obj
            
            logger.info(f"Generated RFID tag: {rfid_tag} for item: {item_name}")
            return rfid_tag
            
        except Exception as e:
            logger.error(f"Failed to generate RFID tag for {item_id}: {e}")
            raise
    
    def is_rfid_tag_unique(self, rfid_tag: str) -> bool:
        """Check if RFID tag is unique"""
        return rfid_tag not in self.rfid_tags
    
    def get_supplies_without_rfid(self) -> List[MedicalSupply]:
        """Get all medical supplies that don't have RFID tags"""
        supplies_without_rfid = []
        
        for supply in self.alerts_service.get_medical_supplies():
            # Check if this supply already has an RFID tag
            has_rfid = any(tag.item_id == supply.id for tag in self.rfid_tags.values())
            if not has_rfid:
                supplies_without_rfid.append(supply)
        
        return supplies_without_rfid
    
    def assign_rfid_tags(self, dry_run: bool = False) -> Dict[str, Any]:
        """
        Assign RFID tags to all medical supplies that don't have them
        
        Args:
            dry_run: If True, only simulate the assignment without saving
            
        Returns:
            Dictionary with assignment results
        """
        try:
            supplies_without_rfid = self.get_supplies_without_rfid()
            
            if not supplies_without_rfid:
                logger.info("All medical supplies already have RFID tags assigned")
                return {
                    "status": "success",
                    "message": "All medical supplies already have RFID tags",
                    "assigned_count": 0,
                    "total_supplies": len(self.alerts_service.get_medical_supplies()),
                    "supplies_without_rfid": 0
                }
            
            logger.info(f"Found {len(supplies_without_rfid)} supplies without RFID tags")
            
            assigned_tags = []
            failed_assignments = []
            
            for supply in supplies_without_rfid:
                try:
                    rfid_tag = self.generate_rfid_tag(supply.id, supply.name)
                    
                    if not dry_run:
                        # Update the medical supply with RFID tag
                        # Note: In a real implementation, you'd update the database
                        # For now, we'll just store it in our RFID service
                        assigned_tags.append({
                            "item_id": supply.id,
                            "item_name": supply.name,
                            "rfid_tag": rfid_tag,
                            "assigned_at": datetime.now(timezone.utc).isoformat()
                        })
                    
                    logger.info(f"Assigned RFID tag {rfid_tag} to {supply.name}")
                    
                except Exception as e:
                    logger.error(f"Failed to assign RFID tag to {supply.name}: {e}")
                    failed_assignments.append({
                        "item_id": supply.id,
                        "item_name": supply.name,
                        "error": str(e)
                    })
            
            # Save RFID tags if not dry run
            if not dry_run and assigned_tags:
                self._save_rfid_tags()
            
            return {
                "status": "success",
                "message": f"RFID assignment completed",
                "assigned_count": len(assigned_tags),
                "failed_count": len(failed_assignments),
                "total_supplies": len(self.alerts_service.get_medical_supplies()),
                "supplies_without_rfid": len(supplies_without_rfid),
                "assigned_tags": assigned_tags,
                "failed_assignments": failed_assignments,
                "dry_run": dry_run
            }
            
        except Exception as e:
            logger.error(f"RFID assignment failed: {e}")
            return {
                "status": "error",
                "message": f"RFID assignment failed: {str(e)}",
                "assigned_count": 0,
                "failed_count": 0,
                "total_supplies": 0,
                "supplies_without_rfid": 0
            }
    
    def get_rfid_statistics(self) -> Dict[str, Any]:
        """Get RFID assignment statistics"""
        total_supplies = len(self.alerts_service.get_medical_supplies())
        supplies_with_rfid = len([tag for tag in self.rfid_tags.values() if tag.status == "active"])
        supplies_without_rfid = total_supplies - supplies_with_rfid
        
        return {
            "total_supplies": total_supplies,
            "supplies_with_rfid": supplies_with_rfid,
            "supplies_without_rfid": supplies_without_rfid,
            "rfid_coverage_percentage": (supplies_with_rfid / total_supplies * 100) if total_supplies > 0 else 0,
            "total_rfid_tags": len(self.rfid_tags),
            "active_rfid_tags": len([tag for tag in self.rfid_tags.values() if tag.status == "active"]),
            "inactive_rfid_tags": len([tag for tag in self.rfid_tags.values() if tag.status != "active"])
        }
    
    def validate_rfid_tags(self) -> Dict[str, Any]:
        """Validate all RFID tags for integrity"""
        validation_results = {
            "total_tags": len(self.rfid_tags),
            "valid_tags": 0,
            "invalid_tags": 0,
            "errors": []
        }
        
        for tag_id, tag in self.rfid_tags.items():
            try:
                # Validate checksum
                expected_checksum = hashlib.md5(tag_id.encode()).hexdigest()[:8]
                if tag.checksum != expected_checksum:
                    validation_results["invalid_tags"] += 1
                    validation_results["errors"].append({
                        "tag_id": tag_id,
                        "error": "Checksum mismatch",
                        "expected": expected_checksum,
                        "actual": tag.checksum
                    })
                else:
                    validation_results["valid_tags"] += 1
                    
            except Exception as e:
                validation_results["invalid_tags"] += 1
                validation_results["errors"].append({
                    "tag_id": tag_id,
                    "error": str(e)
                })
        
        return validation_results
    
    def export_rfid_report(self, filename: str = "rfid_report.json") -> str:
        """Export RFID assignment report to JSON file"""
        try:
            report = {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "statistics": self.get_rfid_statistics(),
                "validation": self.validate_rfid_tags(),
                "rfid_tags": [tag.dict() for tag in self.rfid_tags.values()],
                "supplies_without_rfid": [
                    {
                        "id": supply.id,
                        "name": supply.name,
                        "current_stock": supply.current_stock,
                        "supplier": supply.supplier_name
                    }
                    for supply in self.get_supplies_without_rfid()
                ]
            }
            
            with open(filename, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            logger.info(f"RFID report exported to {filename}")
            return filename
            
        except Exception as e:
            logger.error(f"Failed to export RFID report: {e}")
            raise

def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(description="RFID Tag Assignment System for CIMS")
    parser.add_argument("--dry-run", action="store_true", help="Simulate assignment without saving")
    parser.add_argument("--statistics", action="store_true", help="Show RFID statistics")
    parser.add_argument("--validate", action="store_true", help="Validate existing RFID tags")
    parser.add_argument("--export-report", action="store_true", help="Export RFID report to JSON")
    parser.add_argument("--report-filename", default="rfid_report.json", help="Report filename")
    
    args = parser.parse_args()
    
    # Initialize RFID service
    rfid_service = RFIDAssignmentService()
    
    try:
        if args.statistics:
            # Show statistics
            stats = rfid_service.get_rfid_statistics()
            print("\n=== RFID Assignment Statistics ===")
            print(f"Total Supplies: {stats['total_supplies']}")
            print(f"Supplies with RFID: {stats['supplies_with_rfid']}")
            print(f"Supplies without RFID: {stats['supplies_without_rfid']}")
            print(f"RFID Coverage: {stats['rfid_coverage_percentage']:.1f}%")
            print(f"Total RFID Tags: {stats['total_rfid_tags']}")
            print(f"Active RFID Tags: {stats['active_rfid_tags']}")
            print(f"Inactive RFID Tags: {stats['inactive_rfid_tags']}")
            
        elif args.validate:
            # Validate RFID tags
            validation = rfid_service.validate_rfid_tags()
            print("\n=== RFID Tag Validation ===")
            print(f"Total Tags: {validation['total_tags']}")
            print(f"Valid Tags: {validation['valid_tags']}")
            print(f"Invalid Tags: {validation['invalid_tags']}")
            
            if validation['errors']:
                print("\nErrors:")
                for error in validation['errors']:
                    print(f"  - {error['tag_id']}: {error['error']}")
                    
        elif args.export_report:
            # Export report
            filename = rfid_service.export_rfid_report(args.report_filename)
            print(f"\nRFID report exported to: {filename}")
            
        else:
            # Assign RFID tags
            print(f"\n{'DRY RUN MODE' if args.dry_run else 'LIVE MODE'}")
            print("=" * 50)
            
            result = rfid_service.assign_rfid_tags(dry_run=args.dry_run)
            
            print(f"\n=== RFID Assignment Results ===")
            print(f"Status: {result['status']}")
            print(f"Message: {result['message']}")
            print(f"Assigned: {result['assigned_count']}")
            print(f"Failed: {result['failed_count']}")
            print(f"Total Supplies: {result['total_supplies']}")
            print(f"Supplies without RFID: {result['supplies_without_rfid']}")
            
            if result['assigned_tags']:
                print(f"\nAssigned RFID Tags:")
                for assignment in result['assigned_tags']:
                    print(f"  - {assignment['item_name']}: {assignment['rfid_tag']}")
            
            if result['failed_assignments']:
                print(f"\nFailed Assignments:")
                for failure in result['failed_assignments']:
                    print(f"  - {failure['item_name']}: {failure['error']}")
    
    except Exception as e:
        logger.error(f"CLI execution failed: {e}")
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

