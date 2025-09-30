"use client";

import { useState, useEffect } from "react";
import {
  adminApi,
  buildingsApi,
  floorsApi,
  blocksApi,
  resourcesApi,
} from "@/api/api";
import type { Building, Floor, Block, Resource } from "@/api/api";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Layers, LayoutGrid, MapPin, Loader2 } from "lucide-react";

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
      toast.success("Building created successfully!");
    } catch (error: unknown) {
      console.error("Error creating building:", error);
      toast.error(error instanceof Error ? error.message : "Error creating building");
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
      toast.success("Floor created successfully!");
    } catch (error: unknown) {
      console.error("Error creating floor:", error);
      toast.error(error instanceof Error ? error.message : "Error creating floor");
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
      toast.success("Block created successfully!");
      // Reload blocks if we're showing blocks for this floor
      if (blockForm.floorId) {
        loadBlocksByFloor(blockForm.floorId);
      }
    } catch (error: unknown) {
      console.error("Error creating block:", error);
      toast.error(error instanceof Error ? error.message : "Error creating block");
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
      toast.success("Resource created successfully!");
      // Reload resources if we're showing resources for this block
      if (resourceForm.blockId) {
        loadResourcesByBlock(resourceForm.blockId);
      }
    } catch (error: unknown) {
      console.error("Error creating resource:", error);
      toast.error(error instanceof Error ? error.message : "Error creating resource");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Resource Management
            </h1>
            <p className="text-lg text-gray-600">
              Admin Panel - Manage buildings, floors, blocks, and resources
            </p>
          </div>

          <Card className="shadow-lg">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "buildings" | "floors" | "blocks" | "resources")}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="buildings"
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Buildings
                </TabsTrigger>
                <TabsTrigger value="floors" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Floors
                </TabsTrigger>
                <TabsTrigger value="blocks" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Blocks
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Resources
                </TabsTrigger>
              </TabsList>

              {/* Buildings Tab */}
              <TabsContent value="buildings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Create New Building
                    </CardTitle>
                    <CardDescription>
                      Add a new building to your resource management system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateBuilding} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="building-name">Building Name *</Label>
                        <Input
                          id="building-name"
                          type="text"
                          value={buildingForm.name}
                          onChange={(e) =>
                            setBuildingForm({
                              ...buildingForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Main Building"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="building-description">
                          Description
                        </Label>
                        <Textarea
                          id="building-description"
                          value={buildingForm.description}
                          onChange={(e) =>
                            setBuildingForm({
                              ...buildingForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading || !buildingForm.name.trim()}
                        className="w-full sm:w-auto"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Building"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {buildings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Existing Buildings</CardTitle>
                      <CardDescription>
                        {buildings.length} building
                        {buildings.length !== 1 ? "s" : ""} in your system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {buildings.map((building) => (
                          <div
                            key={building.id}
                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{building.name}</h4>
                              {building.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {building.description}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {building.id}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Floors Tab */}
              <TabsContent value="floors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Create New Floor
                    </CardTitle>
                    <CardDescription>
                      Add a new floor to an existing building
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateFloor} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="floor-building">Building *</Label>
                        <Select
                          value={floorForm.buildingId.toString()}
                          onValueChange={(value) =>
                            setFloorForm({
                              ...floorForm,
                              buildingId: Number(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a building" />
                          </SelectTrigger>
                          <SelectContent>
                            {buildings.map((building) => (
                              <SelectItem
                                key={building.id}
                                value={building.id.toString()}
                              >
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor-name">Floor Name *</Label>
                        <Input
                          id="floor-name"
                          type="text"
                          value={floorForm.name}
                          onChange={(e) =>
                            setFloorForm({ ...floorForm, name: e.target.value })
                          }
                          placeholder="e.g., Ground Floor"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="floor-description">Description</Label>
                        <Textarea
                          id="floor-description"
                          value={floorForm.description}
                          onChange={(e) =>
                            setFloorForm({
                              ...floorForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !floorForm.name.trim() ||
                          floorForm.buildingId === 0
                        }
                        className="w-full"
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoading ? "Creating..." : "Create Floor"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Existing Floors</CardTitle>
                    <CardDescription>
                      Manage all floors across buildings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {floors.map((floor) => (
                        <Card key={floor.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{floor.name}</h4>
                              {floor.description && (
                                <p className="text-sm text-muted-foreground">
                                  {floor.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Building:{" "}
                                {
                                  buildings.find(
                                    (b) => b.id === floor.buildingId
                                  )?.name
                                }
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Blocks Tab */}
              <TabsContent value="blocks" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5" />
                      Create New Block
                    </CardTitle>
                    <CardDescription>
                      Add a new block to a floor within a building
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateBlock} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="block-building">Building *</Label>
                        <Select
                          value={
                            floors.length > 0 && floors[0]
                              ? floors
                                  .find((f) => f.id === blockForm.floorId)
                                  ?.buildingId?.toString() || "0"
                              : "0"
                          }
                          onValueChange={async (value) => {
                            const buildingId = Number(value);
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
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a building" />
                          </SelectTrigger>
                          <SelectContent>
                            {buildings.map((building) => (
                              <SelectItem
                                key={building.id}
                                value={building.id.toString()}
                              >
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="block-floor">Floor *</Label>
                        <Select
                          value={blockForm.floorId.toString()}
                          onValueChange={(value) => {
                            const floorId = Number(value);
                            setBlockForm({
                              ...blockForm,
                              floorId: floorId,
                            });
                            if (floorId > 0) {
                              loadBlocksByFloor(floorId);
                            }
                          }}
                          disabled={floors.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                floors.length === 0
                                  ? "Select a building first"
                                  : "Select a floor"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {floors.map((floor) => (
                              <SelectItem
                                key={floor.id}
                                value={floor.id.toString()}
                              >
                                {floor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="block-name">Block Name *</Label>
                        <Input
                          id="block-name"
                          type="text"
                          value={blockForm.name}
                          onChange={(e) =>
                            setBlockForm({ ...blockForm, name: e.target.value })
                          }
                          placeholder="e.g., Block A"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="block-description">Description</Label>
                        <Textarea
                          id="block-description"
                          value={blockForm.description}
                          onChange={(e) =>
                            setBlockForm({
                              ...blockForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !blockForm.name.trim() ||
                          blockForm.floorId === 0
                        }
                        className="w-full"
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoading ? "Creating..." : "Create Block"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Display existing blocks for selected floor */}
                {blockForm.floorId > 0 && blocks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Existing Blocks on this Floor</CardTitle>
                      <CardDescription>
                        Blocks currently available on the selected floor
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {blocks.map((block) => (
                          <Card key={block.id} className="p-4">
                            <div className="space-y-1">
                              <h4 className="font-medium">{block.name}</h4>
                              {block.description && (
                                <p className="text-sm text-muted-foreground">
                                  {block.description}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Create New Resource
                    </CardTitle>
                    <CardDescription>
                      Add a new resource to a block within a building and floor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateResource} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="resource-building">Building *</Label>
                        <Select
                          value={
                            floors.length > 0 && floors[0]
                              ? floors
                                  .find(
                                    (f) =>
                                      blocks.find(
                                        (b) => b.id === resourceForm.blockId
                                      )?.floorId === f.id
                                  )
                                  ?.buildingId?.toString() || "0"
                              : "0"
                          }
                          onValueChange={async (value) => {
                            const buildingId = Number(value);
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
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a building" />
                          </SelectTrigger>
                          <SelectContent>
                            {buildings.map((building) => (
                              <SelectItem
                                key={building.id}
                                value={building.id.toString()}
                              >
                                {building.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resource-floor">Floor *</Label>
                        <Select
                          value={
                            blocks.length > 0 && blocks[0]
                              ? blocks
                                  .find((b) => b.id === resourceForm.blockId)
                                  ?.floorId?.toString() || "0"
                              : "0"
                          }
                          onValueChange={async (value) => {
                            const floorId = Number(value);
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
                          disabled={floors.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                floors.length === 0
                                  ? "Select a building first"
                                  : "Select a floor"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {floors.map((floor) => (
                              <SelectItem
                                key={floor.id}
                                value={floor.id.toString()}
                              >
                                {floor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resource-block">Block *</Label>
                        <Select
                          value={resourceForm.blockId.toString()}
                          onValueChange={(value) => {
                            const blockId = Number(value);
                            setResourceForm({
                              ...resourceForm,
                              blockId: blockId,
                            });
                            if (blockId > 0) {
                              loadResourcesByBlock(blockId);
                            }
                          }}
                          disabled={blocks.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                blocks.length === 0
                                  ? "Select a floor first"
                                  : "Select a block"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {blocks.map((block) => (
                              <SelectItem
                                key={block.id}
                                value={block.id.toString()}
                              >
                                {block.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resource-name">Resource Name *</Label>
                        <Input
                          id="resource-name"
                          type="text"
                          value={resourceForm.name}
                          onChange={(e) =>
                            setResourceForm({
                              ...resourceForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Conference Room A, Projector"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resource-type">Resource Type *</Label>
                        <Select
                          value={resourceForm.type}
                          onValueChange={(value) =>
                            setResourceForm({
                              ...resourceForm,
                              type: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Conference Room">
                              Conference Room
                            </SelectItem>
                            <SelectItem value="Meeting Room">
                              Meeting Room
                            </SelectItem>
                            <SelectItem value="Equipment">Equipment</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Workspace">Workspace</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resource-capacity">Capacity *</Label>
                        <Input
                          id="resource-capacity"
                          type="number"
                          min="1"
                          value={resourceForm.capacity}
                          onChange={(e) =>
                            setResourceForm({
                              ...resourceForm,
                              capacity: Number(e.target.value),
                            })
                          }
                          placeholder="e.g., 10"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resource-description">
                          Description
                        </Label>
                        <Textarea
                          id="resource-description"
                          value={resourceForm.description}
                          onChange={(e) =>
                            setResourceForm({
                              ...resourceForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !resourceForm.name.trim() ||
                          !resourceForm.type.trim() ||
                          resourceForm.blockId === 0 ||
                          resourceForm.capacity < 1
                        }
                        className="w-full"
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoading ? "Creating..." : "Create Resource"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Display existing resources for selected block */}
                {resourceForm.blockId > 0 && resources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Existing Resources in this Block</CardTitle>
                      <CardDescription>
                        Resources currently available in the selected block
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {resources.map((resource) => (
                          <Card key={resource.id} className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{resource.name}</h4>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="bg-secondary px-2 py-1 rounded">
                                    {resource.type}
                                  </span>
                                  <span className="bg-secondary px-2 py-1 rounded">
                                    Capacity: {resource.capacity}
                                  </span>
                                </div>
                              </div>
                              {resource.description && (
                                <p className="text-sm text-muted-foreground">
                                  {resource.description}
                                </p>
                              )}
                              {resource.fullPath && (
                                <p className="text-xs text-muted-foreground">
                                  Location: {resource.fullPath}
                                </p>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
