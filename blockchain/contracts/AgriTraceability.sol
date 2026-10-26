// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriTraceability
 * @dev Smart Contract for AgriFlow AI Supply Chain Traceability.
 * Records immutable farm-to-fork crop milestones on the Polygon Amoy blockchain.
 */
contract AgriTraceability {
    address public owner;

    struct CropEvent {
        string eventType;      // HARVESTED, QUALITY_CHECKED, BOOKED, PICKUP_SCHEDULED, PICKED_UP, IN_TRANSIT, DELIVERED, PAYMENT_RECEIVED
        string location;       // Farm location, transit hub, or warehouse
        string dataHash;       // SHA-256 fingerprint of event metadata
        uint256 timestamp;     // Block timestamp
        address recordedBy;    // Submitting wallet/relayer
    }

    struct CropBatch {
        string batchId;        // Unique identifier (cropId or orderId)
        string cropName;
        string farmerId;
        uint256 registeredAt;
        bool exists;
        CropEvent[] events;
    }

    // Mapping from batchId to CropBatch
    mapping(string => CropBatch) private batches;

    // List of all registered batch IDs
    string[] public allBatchIds;

    // Events emitted for off-chain indexing
    event BatchRegistered(
        string indexed batchId,
        string cropName,
        string farmerId,
        uint256 timestamp,
        address indexed recordedBy
    );

    event TraceabilityRecorded(
        string indexed batchId,
        string eventType,
        string location,
        string dataHash,
        uint256 timestamp,
        address indexed recordedBy
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can execute this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register a new crop batch on chain
     */
    function registerBatch(
        string memory _batchId,
        string memory _cropName,
        string memory _farmerId
    ) public {
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(!batches[_batchId].exists, "Batch already registered");

        CropBatch storage newBatch = batches[_batchId];
        newBatch.batchId = _batchId;
        newBatch.cropName = _cropName;
        newBatch.farmerId = _farmerId;
        newBatch.registeredAt = block.timestamp;
        newBatch.exists = true;

        allBatchIds.push(_batchId);

        emit BatchRegistered(_batchId, _cropName, _farmerId, block.timestamp, msg.sender);
    }

    /**
     * @dev Record a traceability milestone event for a batch
     */
    function recordEvent(
        string memory _batchId,
        string memory _eventType,
        string memory _location,
        string memory _dataHash
    ) public {
        // Auto-register batch if not previously registered
        if (!batches[_batchId].exists) {
            registerBatch(_batchId, "AgriFlow Crop Produce", "AF-SYSTEM");
        }

        CropEvent memory newEvent = CropEvent({
            eventType: _eventType,
            location: _location,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        });

        batches[_batchId].events.push(newEvent);

        emit TraceabilityRecorded(
            _batchId,
            _eventType,
            _location,
            _dataHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Get total events count for a batch
     */
    function getEventCount(string memory _batchId) public view returns (uint256) {
        require(batches[_batchId].exists, "Batch does not exist");
        return batches[_batchId].events.length;
    }

    /**
     * @dev Get a specific event by index
     */
    function getEvent(string memory _batchId, uint256 _index)
        public
        view
        returns (
            string memory eventType,
            string memory location,
            string memory dataHash,
            uint256 timestamp,
            address recordedBy
        )
    {
        require(batches[_batchId].exists, "Batch does not exist");
        require(_index < batches[_batchId].events.length, "Index out of range");

        CropEvent memory ev = batches[_batchId].events[_index];
        return (ev.eventType, ev.location, ev.dataHash, ev.timestamp, ev.recordedBy);
    }

    /**
     * @dev Get batch overview
     */
    function getBatchInfo(string memory _batchId)
        public
        view
        returns (
            string memory cropName,
            string memory farmerId,
            uint256 registeredAt,
            uint256 totalEvents
        )
    {
        require(batches[_batchId].exists, "Batch does not exist");
        CropBatch storage b = batches[_batchId];
        return (b.cropName, b.farmerId, b.registeredAt, b.events.length);
    }
}
