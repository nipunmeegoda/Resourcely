import { useState, useEffect } from "react";
import type { Building, Floor, Block, Resource } from "@/api/api";
import { buildingsApi, floorsApi, blocksApi, resourcesApi } from "@/api/api";

interface CascadingResourceSelectorProps {
  onResourceSelect: (resource: Resource | null) => void;
  selectedResourceId?: number;
}

export default function CascadingResourceSelector({
  onResourceSelect,
}: CascadingResourceSelectorProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(
    null
  );
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );

  const [loading, setLoading] = useState({
    buildings: false,
    floors: false,
    blocks: false,
    resources: false,
  });

  // Load buildings on component mount
  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading((prev) => ({ ...prev, buildings: true }));
      const response = await buildingsApi.getAll();
      setBuildings(response.data);
    } catch (error) {
      console.error("Error loading buildings:", error);
    } finally {
      setLoading((prev) => ({ ...prev, buildings: false }));
    }
  };

  const loadFloors = async (buildingId: number) => {
    try {
      setLoading((prev) => ({ ...prev, floors: true }));
      const response = await floorsApi.getByBuilding(buildingId);
      setFloors(response.data);
    } catch (error) {
      console.error("Error loading floors:", error);
    } finally {
      setLoading((prev) => ({ ...prev, floors: false }));
    }
  };

  const loadBlocks = async (floorId: number) => {
    try {
      setLoading((prev) => ({ ...prev, blocks: true }));
      const response = await blocksApi.getByFloor(floorId);
      setBlocks(response.data);
    } catch (error) {
      console.error("Error loading blocks:", error);
    } finally {
      setLoading((prev) => ({ ...prev, blocks: false }));
    }
  };

  const loadResources = async (blockId: number) => {
    try {
      setLoading((prev) => ({ ...prev, resources: true }));
      const response = await resourcesApi.getByBlock(blockId);
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading((prev) => ({ ...prev, resources: false }));
    }
  };

  const handleBuildingSelect = (buildingId: number) => {
    setSelectedBuildingId(buildingId);
    setSelectedFloorId(null);
    setSelectedBlockId(null);
    setSelectedResource(null);
    setFloors([]);
    setBlocks([]);
    setResources([]);
    onResourceSelect(null);

    if (buildingId > 0) {
      loadFloors(buildingId);
    }
  };

  const handleFloorSelect = (floorId: number) => {
    setSelectedFloorId(floorId);
    setSelectedBlockId(null);
    setSelectedResource(null);
    setBlocks([]);
    setResources([]);
    onResourceSelect(null);

    if (floorId > 0) {
      loadBlocks(floorId);
    }
  };

  const handleBlockSelect = (blockId: number) => {
    setSelectedBlockId(blockId);
    setSelectedResource(null);
    setResources([]);
    onResourceSelect(null);

    if (blockId > 0) {
      loadResources(blockId);
    }
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    onResourceSelect(resource);
  };

  return (
    <div className="space-y-4">
      {/* Building Selection */}
      <div>
        <label
          htmlFor="building-select"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Building *
        </label>
        <select
          id="building-select"
          value={selectedBuildingId || ""}
          onChange={(e) => handleBuildingSelect(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading.buildings}
          title="Select a building"
        >
          <option value="">
            {loading.buildings ? "Loading buildings..." : "Choose a building"}
          </option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      {/* Floor Selection */}
      {selectedBuildingId && (
        <div>
          <label
            htmlFor="floor-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Floor *
          </label>
          <select
            id="floor-select"
            value={selectedFloorId || ""}
            onChange={(e) => handleFloorSelect(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading.floors}
            title="Select a floor"
          >
            <option value="">
              {loading.floors ? "Loading floors..." : "Choose a floor"}
            </option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Block Selection */}
      {selectedFloorId && (
        <div>
          <label
            htmlFor="block-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Block *
          </label>
          <select
            id="block-select"
            value={selectedBlockId || ""}
            onChange={(e) => handleBlockSelect(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading.blocks}
            title="Select a block"
          >
            <option value="">
              {loading.blocks ? "Loading blocks..." : "Choose a block"}
            </option>
            {blocks.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Resource Selection */}
      {selectedBlockId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Resource *
          </label>
          {loading.resources ? (
            <div className="text-gray-500">Loading resources...</div>
          ) : (
            <div className="space-y-2">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => handleResourceSelect(resource)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedResource?.id === resource.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleResourceSelect(resource);
                    }
                  }}
                >
                  <div className="font-medium">{resource.name}</div>
                  <div className="text-sm text-gray-600">
                    {resource.type} • Capacity: {resource.capacity}
                  </div>
                  {resource.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {resource.description}
                    </div>
                  )}
                </div>
              ))}
              {resources.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No resources available in this block
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Resource Summary */}
      {selectedResource && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="font-medium text-green-800">Selected Resource:</div>
          <div className="text-sm text-green-700">
            {selectedResource.buildingName} → {selectedResource.floorName} →{" "}
            {selectedResource.blockName} → {selectedResource.name}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {selectedResource.type} • Capacity: {selectedResource.capacity}
          </div>
        </div>
      )}
    </div>
  );
}
