"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Download, Printer, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Papa from "papaparse";
import { WaterReadingsTable } from "@/components/WaterReadingsTable";
import { Input } from "@/components/ui/input";

interface Room {
  id: number;
  roomNumber: string;
  ownerName: string;
}

interface WaterReading {
  id: number;
  roomId: number;
  month: string;
  lastMonth: number;
  thisMonth: number;
  usage: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface ReadingWithRoom extends WaterReading {
  roomNumber: string;
  ownerName: string;
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [readings, setReadings] = useState<ReadingWithRoom[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState("");
  const [isRollingOver, setIsRollingOver] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchData = async () => {
    const date = new Date();
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(month);

    try {
      const token = localStorage.getItem("bearer_token");

      // Fetch rooms
      const roomsRes = await fetch("/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const roomsData = await roomsRes.json();
      setRooms(roomsData);

      // Fetch readings
      const readingsRes = await fetch(`/api/water-readings?month=${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const readingsData = await readingsRes.json();

      // Combine readings with room info
      const combined = readingsData.map((reading: WaterReading) => {
        const room = roomsData.find((r: Room) => r.id === reading.roomId);
        return {
          ...reading,
          roomNumber: room?.roomNumber || "",
          ownerName: room?.ownerName || "",
        };
      });

      setReadings(combined);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const token = localStorage.getItem("bearer_token");
          let successCount = 0;
          let errorCount = 0;

          for (const row of results.data as any[]) {
            if (!row.roomNumber || !row.thisMonth) continue;

            // Find room by room number
            const room = rooms.find(
              (r) => r.roomNumber.toLowerCase() === row.roomNumber.toLowerCase()
            );

            if (!room) {
              errorCount++;
              continue;
            }

            try {
              await fetch("/api/water-readings", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  roomId: room.id,
                  month: currentMonth,
                  lastMonth: parseFloat(row.lastMonth || "0"),
                  thisMonth: parseFloat(row.thisMonth),
                  pricePerUnit: parseFloat(row.pricePerUnit || "5"),
                }),
              });
              successCount++;
            } catch {
              errorCount++;
            }
          }

          toast.success(`Imported ${successCount} readings${errorCount > 0 ? `, ${errorCount} failed` : ""}`);
          fetchData();
        } catch (error) {
          toast.error("Failed to import CSV");
        }
      },
      error: () => {
        toast.error("Failed to parse CSV file");
      },
    });

    e.target.value = "";
  };

  const handleExportCSV = () => {
    const csvData = readings.map((r) => ({
      roomNumber: r.roomNumber,
      ownerName: r.ownerName,
      lastMonth: r.lastMonth,
      thisMonth: r.thisMonth,
      usage: r.usage,
      pricePerUnit: r.pricePerUnit,
      totalPrice: r.totalPrice,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water-readings-${currentMonth}.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog");
  };

  const handleNextMonth = async () => {
    setIsRollingOver(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const fromDate = new Date(currentMonth);
      const toDate = new Date(fromDate.setMonth(fromDate.getMonth() + 1));
      const toMonth = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}`;

      const response = await fetch(
        `/api/water-readings/rollover?fromMonth=${currentMonth}&toMonth=${toMonth}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Successfully rolled over to next month");
        setCurrentMonth(toMonth);
        fetchData();
      } else {
        toast.error("Failed to rollover to next month");
      }
    } catch (error) {
      toast.error("An error occurred during rollover");
    } finally {
      setIsRollingOver(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 print:hidden">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-4 print:hidden">
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" asChild>
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Import CSV
                </span>
              </Button>
            </label>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleNextMonth} disabled={isRollingOver}>
            <ArrowRight className="mr-2 h-4 w-4" />
            {isRollingOver ? "Processing..." : "Next Month"}
          </Button>
          <div className="ml-auto text-sm font-medium">Current Month: {currentMonth}</div>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Water Readings for {currentMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center">Loading...</div>
            ) : readings.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No readings found for this month. Import CSV or add readings manually.
              </div>
            ) : (
              <WaterReadingsTable
                readings={readings}
                onUpdate={fetchData}
                currentMonth={currentMonth}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
