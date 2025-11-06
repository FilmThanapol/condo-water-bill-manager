"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { Droplets, DollarSign, TrendingUp, Calendar, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface SummaryData {
  month: string;
  totalRooms: number;
  totalUsage: number;
  totalRevenue: number;
  averageUsage: number;
  averagePrice: number;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchSummary = async () => {
      const date = new Date();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      setCurrentMonth(month);

      try {
        const token = localStorage.getItem("bearer_token");
        const response = await fetch(`/api/water-readings/summary?month=${month}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchSummary();
    }
  }, [session]);

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    if (error) {
      toast.error("Sign out failed");
    } else {
      localStorage.removeItem("bearer_token");
      router.push("/login");
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const chartData = summary
    ? [
        {
          name: "Usage",
          value: summary.totalUsage,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Condo Water Bill Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {session.user.name}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Link href="/admin">
            <Card className="cursor-pointer transition-all hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <FileText className="h-12 w-12 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Admin Panel</h3>
                  <p className="text-sm text-muted-foreground">Manage water readings and import data</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Calendar className="h-12 w-12 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">Current Month</h3>
                <p className="text-sm text-muted-foreground">{currentMonth}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="text-center">Loading summary...</div>
        ) : summary ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Water Used</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalUsage} m³</div>
                  <p className="text-xs text-muted-foreground">Across {summary.totalRooms} rooms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">For {currentMonth}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Usage</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.averageUsage} m³</div>
                  <p className="text-xs text-muted-foreground">Per room</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Bill</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${summary.averagePrice}</div>
                  <p className="text-xs text-muted-foreground">Per room</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Water Usage Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" name="Total Usage (m³)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Highest Usage:</span>
                    <span className="text-sm text-muted-foreground">{summary.totalUsage} m³</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Rooms:</span>
                    <span className="text-sm text-muted-foreground">{summary.totalRooms}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Month:</span>
                    <span className="text-sm text-muted-foreground">{currentMonth}</span>
                  </div>
                  <div className="mt-6">
                    <Link href="/admin">
                      <Button className="w-full">View Detailed Readings</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No data available for {currentMonth}</p>
              <Link href="/admin">
                <Button className="mt-4">Go to Admin Panel to Add Data</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
