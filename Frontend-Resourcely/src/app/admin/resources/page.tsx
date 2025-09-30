// src/app/admin/resources/page.tsx
import { useState, useEffect } from "react";
import {
  adminApi,
  buildingsApi,
  floorsApi,
  blocksApi,
  resourcesApi,
} from "../../../api";
import type { Building, Floor, Block, Resource } from "../../../api";
import Navbar from "../../../components/Navbar";

export default function AdminResourcesPage() {
  const [activeTab, setActiveTab] = useState<
    "buildings" | "floors" | "blocks" | "resources"
  >("buildings");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [buildingForm, setBuildingForm] = useState({
    name: "",
    description: "",
  });
  const [floorForm, setFloorForm] = useState({
    name: "",
    description: "",
    buildingId: 0,
  });
  const [blockForm, setBlockForm] = useState({
    name: "",
    description: "",
    floorId: 0,
  });
  const [resourceForm, setResourceForm] = useState({
    name: "",
    type: "",
    description: "",
    capacity: 1,
    blockId: 0,
  });

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await buildingsApi.getAll();
      setBuildings(response.data);
    } catch (error) {
      console.error("Error loading buildings:", error);
    }
  };

  const loadFloorsByBuilding = async (buildingId: number) => {
    try {
      const response = await floorsApi.getByBuilding(buildingId);
      setFloors(response.data);
    } catch (error) {
      console.error("Error loading floors:", error);
    }
  };

  const loadBlocksByFloor = async (floorId: number) => {
    try {
      const response = await blocksApi.getByFloor(floorId);
      setBlocks(response.data);
    } catch (error) {
      console.error("Error loading blocks:", error);
    }
  };

  const loadResourcesByBlock = async (blockId: number) => {
    try {
      const response = await resourcesApi.getByBlock(blockId);
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    }
  };

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingForm.name.trim()) return;

    setIsLoading(true);
    try {
      await adminApi.createBuilding(buildingForm);
      setBuildingForm({ name: "", description: "" });
      loadBuildings();
      alert("Building created successfully!");
    } catch (error: any) {
      console.error("Error creating building:", error);
      alert(error.response?.data?.message || "Error creating building");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorForm.name.trim() || floorForm.buildingId === 0) return;

    setIsLoading(true);
    try {
      await adminApi.createFloor(floorForm);
      setFloorForm({ name: "", description: "", buildingId: 0 });
      alert("Floor created successfully!");
    } catch (error: any) {
      console.error("Error creating floor:", error);
      alert(error.response?.data?.message || "Error creating floor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockForm.name.trim() || blockForm.floorId === 0) return;

    setIsLoading(true);
    try {
      await adminApi.createBlock(blockForm);
      setBlockForm({ name: "", description: "", floorId: 0 });
      alert("Block created successfully!");
      // Reload blocks if we're showing blocks for this floor
      if (blockForm.floorId) {
        loadBlocksByFloor(blockForm.floorId);
      }
    } catch (error: any) {
      console.error("Error creating block:", error);
      alert(error.response?.data?.message || "Error creating block");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !resourceForm.name.trim() ||
      !resourceForm.type.trim() ||
      resourceForm.blockId === 0 ||
      resourceForm.capacity < 1
    )
      return;

    setIsLoading(true);
    try {
      await adminApi.createResource(resourceForm);
      setResourceForm({
        name: "",
        type: "",
        description: "",
        capacity: 1,
        blockId: 0,
      });
      alert("Resource created successfully!");
      // Reload resources if we're showing resources for this block
      if (resourceForm.blockId) {
        loadResourcesByBlock(resourceForm.blockId);
      }
    } catch (error: any) {
      console.error("Error creating resource:", error);
      alert(error.response?.data?.message || "Error creating resource");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />

      <div className="p-8 bg-blue-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Resource Management - Admin Panel
          </h1>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {[
                  { key: "buildings", label: "Buildings" },
                  { key: "floors", label: "Floors" },
                  { key: "blocks", label: "Blocks" },
                  { key: "resources", label: "Resources" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Buildings Tab */}
              {activeTab === "buildings" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Create New Building
                  </h2>
                  <form onSubmit={handleCreateBuilding} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building Name *
                      </label>
                      <input
                        type="text"
                        value={buildingForm.name}
                        onChange={(e) =>
                          setBuildingForm({
                            ...buildingForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Main Building"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={buildingForm.description}
                        onChange={(e) =>
                          setBuildingForm({
                            ...buildingForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !buildingForm.name.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating..." : "Create Building"}
                    </button>
                  </form>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">
                      Existing Buildings
                    </h3>
                    <div className="space-y-2">
                      {buildings.map((building) => (
                        <div
                          key={building.id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="font-medium">{building.name}</div>
                          {building.description && (
                            <div className="text-sm text-gray-600">
                              {building.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Floors Tab */}
              {activeTab === "floors" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Create New Floor
                  </h2>
                  <form onSubmit={handleCreateFloor} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building *
                      </label>
                      <select
                        value={floorForm.buildingId}
                        onChange={(e) =>
                          setFloorForm({
                            ...floorForm,
                            buildingId: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select a building"
                        required
                      >
                        <option value={0}>Select a building</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor Name *
                      </label>
                      <input
                        type="text"
                        value={floorForm.name}
                        onChange={(e) =>
                          setFloorForm({ ...floorForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Ground Floor"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={floorForm.description}
                        onChange={(e) =>
                          setFloorForm({
                            ...floorForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !floorForm.name.trim() ||
                        floorForm.buildingId === 0
                      }
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating..." : "Create Floor"}
                    </button>
                  </form>
                </div>
              )}

              {/* Blocks Tab */}
              {activeTab === "blocks" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Create New Block
                  </h2>
                  <form onSubmit={handleCreateBlock} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building *
                      </label>
                      <select
                        value={
                          floors.length > 0 && floors[0]
                            ? floors.find((f) => f.id === blockForm.floorId)
                                ?.buildingId || 0
                            : 0
                        }
                        onChange={async (e) => {
                          const buildingId = Number(e.target.value);
                          if (buildingId > 0) {
                            await loadFloorsByBuilding(buildingId);
                            setBlockForm({
                              name: "",
                              description: "",
                              floorId: 0,
                            });
                          } else {
                            setFloors([]);
                            setBlockForm({
                              name: "",
                              description: "",
                              floorId: 0,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select a building first"
                      >
                        <option value={0}>Select a building</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor *
                      </label>
                      <select
                        value={blockForm.floorId}
                        onChange={(e) => {
                          const floorId = Number(e.target.value);
                          setBlockForm({
                            ...blockForm,
                            floorId: floorId,
                          });
                          if (floorId > 0) {
                            loadBlocksByFloor(floorId);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select a floor"
                        required
                        disabled={floors.length === 0}
                      >
                        <option value={0}>
                          {floors.length === 0
                            ? "Select a building first"
                            : "Select a floor"}
                        </option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Block Name *
                      </label>
                      <input
                        type="text"
                        value={blockForm.name}
                        onChange={(e) =>
                          setBlockForm({ ...blockForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Block A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={blockForm.description}
                        onChange={(e) =>
                          setBlockForm({
                            ...blockForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !blockForm.name.trim() ||
                        blockForm.floorId === 0
                      }
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating..." : "Create Block"}
                    </button>
                  </form>

                  {/* Display existing blocks for selected floor */}
                  {blockForm.floorId > 0 && blocks.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Existing Blocks on this Floor
                      </h3>
                      <div className="space-y-2">
                        {blocks.map((block) => (
                          <div
                            key={block.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="font-medium">{block.name}</div>
                            {block.description && (
                              <div className="text-sm text-gray-600">
                                {block.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resources Tab */}
              {activeTab === "resources" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Create New Resource
                  </h2>
                  <form onSubmit={handleCreateResource} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building *
                      </label>
                      <select
                        value={
                          floors.length > 0 && floors[0]
                            ? floors.find(
                                (f) =>
                                  blocks.find(
                                    (b) => b.id === resourceForm.blockId
                                  )?.floorId === f.id
                              )?.buildingId || 0
                            : 0
                        }
                        onChange={async (e) => {
                          const buildingId = Number(e.target.value);
                          if (buildingId > 0) {
                            await loadFloorsByBuilding(buildingId);
                            setBlocks([]);
                            setResources([]);
                            setResourceForm({
                              name: "",
                              type: "",
                              description: "",
                              capacity: 1,
                              blockId: 0,
                            });
                          } else {
                            setFloors([]);
                            setBlocks([]);
                            setResources([]);
                            setResourceForm({
                              name: "",
                              type: "",
                              description: "",
                              capacity: 1,
                              blockId: 0,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select a building first"
                      >
                        <option value={0}>Select a building</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor *
                      </label>
                      <select
                        value={
                          blocks.length > 0 && blocks[0]
                            ? blocks.find((b) => b.id === resourceForm.blockId)
                                ?.floorId || 0
                            : 0
                        }
                        onChange={async (e) => {
                          const floorId = Number(e.target.value);
                          if (floorId > 0) {
                            await loadBlocksByFloor(floorId);
                            setResources([]);
                            setResourceForm({
                              name: "",
                              type: "",
                              description: "",
                              capacity: 1,
                              blockId: 0,
                            });
                          } else {
                            setBlocks([]);
                            setResources([]);
                            setResourceForm({
                              name: "",
                              type: "",
                              description: "",
                              capacity: 1,
                              blockId: 0,
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select a floor"
                        disabled={floors.length === 0}
                      >
                        <option value={0}>
                          {floors.length === 0
                            ? "Select a building first"
                            : "Select a floor"}
                        </option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Block *
                      </label>
                      <select
                        value={resourceForm.blockId}
                        onChange={(e) => {
                          const blockId = Number(e.target.value);
                          setResourceForm({
                            ...resourceForm,
                            blockId: blockId,
                          });
                          if (blockId > 0) {
                            loadResourcesByBlock(blockId);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select a block"
                        required
                        disabled={blocks.length === 0}
                      >
                        <option value={0}>
                          {blocks.length === 0
                            ? "Select a floor first"
                            : "Select a block"}
                        </option>
                        {blocks.map((block) => (
                          <option key={block.id} value={block.id}>
                            {block.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Name *
                      </label>
                      <input
                        type="text"
                        value={resourceForm.name}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Conference Room A, Projector"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Type *
                      </label>
                      <select
                        value={resourceForm.type}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Select resource type"
                        required
                      >
                        <option value="">Select a type</option>
                        <option value="Conference Room">Conference Room</option>
                        <option value="Meeting Room">Meeting Room</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Office">Office</option>
                        <option value="Workspace">Workspace</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={resourceForm.capacity}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            capacity: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={resourceForm.description}
                        onChange={(e) =>
                          setResourceForm({
                            ...resourceForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        !resourceForm.name.trim() ||
                        !resourceForm.type.trim() ||
                        resourceForm.blockId === 0 ||
                        resourceForm.capacity < 1
                      }
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Creating..." : "Create Resource"}
                    </button>
                  </form>

                  {/* Display existing resources for selected block */}
                  {resourceForm.blockId > 0 && resources.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4">
                        Existing Resources in this Block
                      </h3>
                      <div className="space-y-2">
                        {resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {resource.name}
                                </div>
                                <div className="text-sm text-gray-600 flex gap-4">
                                  <span>Type: {resource.type}</span>
                                  <span>Capacity: {resource.capacity}</span>
                                </div>
                                {resource.description && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    {resource.description}
                                  </div>
                                )}
                                {resource.fullPath && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Location: {resource.fullPath}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
