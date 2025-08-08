# RFID Tag Assignment System for CIMS

This system generates unique RFID tags and assigns them to medical supplies in the Clinic Inventory Management System (CIMS).

## Features

- ✅ **Globally Unique RFID Tags**: Generates unique RFID tags using UUID and timestamp
- ✅ **Duplicate Prevention**: Ensures no duplicate RFID tags are created
- ✅ **Integrity Validation**: Includes checksums for data integrity
- ✅ **Dry Run Mode**: Test assignments without making changes
- ✅ **Statistics & Reporting**: Comprehensive reporting and statistics
- ✅ **Validation**: Validate existing RFID tags for integrity
- ✅ **Export Reports**: Export detailed reports to JSON format

## RFID Tag Format

```
RFID-{item_id}-{timestamp}-{uuid_short}
```

**Example**: `RFID-ms_001-20241201T143022Z-a1b2c3d4`

- **RFID**: Prefix identifier
- **item_id**: Medical supply ID (e.g., ms_001)
- **timestamp**: ISO format timestamp (YYYYMMDDTHHMMSSZ)
- **uuid_short**: First 8 characters of UUID for uniqueness

## Installation

### Python Version (Recommended)

The Python version is integrated with your existing FastAPI backend.

```bash
# Navigate to backend directory
cd spider1/backend

# Install dependencies (if not already installed)
pip install -r requirements.txt
```

### Node.js Version

```bash
# Navigate to backend directory
cd spider1/backend

# Install Node.js dependencies
npm install
```

## Usage

### Python Version

#### 1. Assign RFID Tags (Live Mode)
```bash
python assign_rfids.py
```

#### 2. Dry Run (Test Mode)
```bash
python assign_rfids.py --dry-run
```

#### 3. Show Statistics
```bash
python assign_rfids.py --statistics
```

#### 4. Validate Existing RFID Tags
```bash
python assign_rfids.py --validate
```

#### 5. Export Report
```bash
python assign_rfids.py --export-report
python assign_rfids.py --export-report --report-filename=my_report.json
```

### Node.js Version

#### 1. Assign RFID Tags (Live Mode)
```bash
node assign_rfids.js
```

#### 2. Dry Run (Test Mode)
```bash
node assign_rfids.js --dry-run
```

#### 3. Show Statistics
```bash
node assign_rfids.js --statistics
```

#### 4. Validate Existing RFID Tags
```bash
node assign_rfids.js --validate
```

#### 5. Export Report
```bash
node assign_rfids.js --export-report
node assign_rfids.js --export-report --report-filename=my_report.json
```

### Using npm Scripts (Node.js)

```bash
# Install dependencies first
npm install

# Then use npm scripts
npm run dry-run
npm run statistics
npm run validate
npm run export-report
```

## Command Line Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Simulate assignment without saving changes |
| `--statistics` | Show RFID assignment statistics |
| `--validate` | Validate existing RFID tags for integrity |
| `--export-report` | Export detailed report to JSON file |
| `--report-filename` | Specify custom report filename |

## Output Examples

### Assignment Results
```
=== RFID Assignment Results ===
Status: success
Message: RFID assignment completed
Assigned: 5
Failed: 0
Total Supplies: 12
Supplies without RFID: 5

Assigned RFID Tags:
  - Paracetamol 500mg: RFID-ms_001-20241201T143022Z-a1b2c3d4
  - Ibuprofen 400mg: RFID-ms_002-20241201T143023Z-b2c3d4e5
  - Aspirin 100mg: RFID-ms_003-20241201T143024Z-c3d4e5f6
```

### Statistics Output
```
=== RFID Assignment Statistics ===
Total Supplies: 12
Supplies with RFID: 8
Supplies without RFID: 4
RFID Coverage: 66.7%
Total RFID Tags: 8
Active RFID Tags: 8
Inactive RFID Tags: 0
```

### Validation Output
```
=== RFID Tag Validation ===
Total Tags: 8
Valid Tags: 8
Invalid Tags: 0
```

## File Structure

```
spider1/backend/
├── assign_rfids.py          # Python RFID assignment system
├── assign_rfids.js          # Node.js RFID assignment system
├── package.json             # Node.js dependencies
├── rfid_tags.json          # RFID tags storage (Python)
├── rfid_assignment.log     # Assignment logs (Python)
└── rfid_report.json        # Generated reports
```

## Database Integration

### Python Version
- Uses existing `AlertsService` and `MedicalSupply` models
- Stores RFID tags in `rfid_tags.json` file
- Integrates with your existing FastAPI backend

### Node.js Version
- Uses Mongoose with MongoDB
- Requires MongoDB connection
- Updates medical supplies with `rfid_tag` field

## RFID Tag Properties

Each RFID tag includes:

- **tag_id**: Unique RFID tag string
- **item_id**: Associated medical supply ID
- **item_name**: Medical supply name
- **generated_at**: Timestamp when tag was created
- **checksum**: MD5 checksum for integrity validation
- **status**: Tag status (active, inactive, lost, damaged)

## Error Handling

The system includes comprehensive error handling:

- ✅ **Duplicate Prevention**: Checks for existing RFID tags
- ✅ **Database Errors**: Handles database connection issues
- ✅ **Validation Errors**: Validates RFID tag integrity
- ✅ **File I/O Errors**: Handles file read/write errors
- ✅ **Logging**: Detailed logging for debugging

## Security Features

- **Checksum Validation**: MD5 checksums for data integrity
- **Unique Constraints**: Database-level uniqueness constraints
- **Audit Trail**: Timestamps for all operations
- **Status Tracking**: Track RFID tag status (active/inactive/lost/damaged)

## Integration with CIMS

### Adding RFID Field to Medical Supplies

The system automatically adds an `rfid_tag` field to medical supply records:

```python
# Python - MedicalSupply model
class MedicalSupply(BaseModel):
    id: str
    name: str
    current_stock: int
    threshold_quantity: int
    expiry_date: Optional[datetime]
    supplier_id: str
    supplier_name: str
    unit: str = "units"
    rfid_tag: Optional[str] = None  # New RFID field
```

```javascript
// Node.js - Medical Supply Schema
const medicalSupplySchema = new mongoose.Schema({
  // ... existing fields
  rfid_tag: { type: String, unique: true, sparse: true }
});
```

### API Integration

You can integrate RFID functionality into your existing API:

```python
# Add to your FastAPI endpoints
@app.get("/inventory/supplies/{item_id}/rfid")
async def get_supply_rfid(item_id: str):
    """Get RFID tag for a specific medical supply"""
    # Implementation here
```

## Troubleshooting

### Common Issues

1. **"No medical supplies found"**
   - Ensure your medical supplies data is loaded
   - Check database connection

2. **"RFID tag already exists"**
   - The system prevents duplicates
   - Check if the supply already has an RFID tag

3. **"Database connection failed"** (Node.js)
   - Ensure MongoDB is running
   - Check connection string in `MONGODB_URI`

4. **"Validation errors"**
   - Run validation to check RFID tag integrity
   - Check for corrupted RFID tag data

### Logs

- **Python**: Check `rfid_assignment.log` for detailed logs
- **Node.js**: Check console output for error messages

## Performance Considerations

- **Batch Processing**: Processes supplies one by one for safety
- **Dry Run Mode**: Test before making changes
- **Validation**: Built-in integrity checks
- **Logging**: Comprehensive logging for monitoring

## Future Enhancements

- [ ] **Bulk Assignment**: Process multiple supplies simultaneously
- [ ] **RFID Tag Deactivation**: Mark tags as lost/damaged
- [ ] **RFID Tag Replacement**: Generate new tags for lost ones
- [ ] **Real-time Monitoring**: Live RFID tag tracking
- [ ] **Integration with Hardware**: Connect to actual RFID readers

## Support

For issues or questions:

1. Check the logs for error messages
2. Run validation to check RFID tag integrity
3. Use dry-run mode to test before making changes
4. Export reports for detailed analysis

## License

MIT License - See LICENSE file for details.

