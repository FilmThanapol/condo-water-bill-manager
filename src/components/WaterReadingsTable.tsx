"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";

interface WaterReading {
  id: number;
  roomId: number;
  month: string;
  lastMonth: number;
  thisMonth: number;
  usage: number;
  pricePerUnit: number;
  totalPrice: number;
  roomNumber: string;
  ownerName: string;
}

interface WaterReadingsTableProps {
  readings: WaterReading[];
  onUpdate: () => void;
  currentMonth: string;
}

export function WaterReadingsTable({ readings, onUpdate, currentMonth }: WaterReadingsTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    lastMonth: string;
    thisMonth: string;
    pricePerUnit: string;
  }>({
    lastMonth: "",
    thisMonth: "",
    pricePerUnit: "",
  });

  const handleEdit = (reading: WaterReading) => {
    setEditingId(reading.id);
    setEditValues({
      lastMonth: reading.lastMonth.toString(),
      thisMonth: reading.thisMonth.toString(),
      pricePerUnit: reading.pricePerUnit.toString(),
    });
  };

  const handleSave = async (id: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/water-readings?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lastMonth: parseFloat(editValues.lastMonth),
          thisMonth: parseFloat(editValues.thisMonth),
          pricePerUnit: parseFloat(editValues.pricePerUnit),
        }),
      });

      if (response.ok) {
        toast.success("Reading updated successfully");
        setEditingId(null);
        onUpdate();
      } else {
        toast.error("Failed to update reading");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room Number</TableHead>
          <TableHead>Owner Name</TableHead>
          <TableHead>Last Month (m³)</TableHead>
          <TableHead>This Month (m³)</TableHead>
          <TableHead>Usage (m³)</TableHead>
          <TableHead>Price/Unit ($)</TableHead>
          <TableHead>Total Price ($)</TableHead>
          <TableHead className="print:hidden">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {readings.map((reading) => (
          <TableRow key={reading.id}>
            <TableCell className="font-medium">{reading.roomNumber}</TableCell>
            <TableCell>{reading.ownerName}</TableCell>
            <TableCell>
              {editingId === reading.id ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editValues.lastMonth}
                  onChange={(e) =>
                    setEditValues({ ...editValues, lastMonth: e.target.value })
                  }
                  className="w-24"
                />
              ) : (
                reading.lastMonth
              )}
            </TableCell>
            <TableCell>
              {editingId === reading.id ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editValues.thisMonth}
                  onChange={(e) =>
                    setEditValues({ ...editValues, thisMonth: e.target.value })
                  }
                  className="w-24"
                />
              ) : (
                reading.thisMonth
              )}
            </TableCell>
            <TableCell className="font-semibold">{reading.usage}</TableCell>
            <TableCell>
              {editingId === reading.id ? (
                <Input
                  type="number"
                  step="0.01"
                  value={editValues.pricePerUnit}
                  onChange={(e) =>
                    setEditValues({ ...editValues, pricePerUnit: e.target.value })
                  }
                  className="w-24"
                />
              ) : (
                reading.pricePerUnit
              )}
            </TableCell>
            <TableCell className="font-bold">${reading.totalPrice.toFixed(2)}</TableCell>
            <TableCell className="print:hidden">
              {editingId === reading.id ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(reading.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => handleEdit(reading)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
        {readings.length > 0 && (
          <TableRow className="font-bold">
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell>{readings.reduce((sum, r) => sum + r.usage, 0).toFixed(2)}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>${readings.reduce((sum, r) => sum + r.totalPrice, 0).toFixed(2)}</TableCell>
            <TableCell className="print:hidden"></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
