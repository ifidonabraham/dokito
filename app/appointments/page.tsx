"use client";

import { useState } from "react";
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Video,
  Plus,
  Search,
  Filter,
  ChevronRight,
  User,
  Building2,
  CalendarCheck,
  CalendarX,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  facilityName: string;
  date: string;
  time: string;
  type: "in-person" | "video" | "phone";
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
}

// Mock appointments data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    doctorName: "Dr. Adaeze Okonkwo",
    specialty: "General Practitioner",
    facilityName: "Lagos University Teaching Hospital",
    date: "2026-05-10",
    time: "09:00 AM",
    type: "in-person",
    status: "upcoming",
    notes: "Annual checkup"
  },
  {
    id: "2",
    doctorName: "Dr. Emeka Nwosu",
    specialty: "Cardiologist",
    facilityName: "Reddington Hospital",
    date: "2026-05-15",
    time: "02:30 PM",
    type: "video",
    status: "upcoming",
    notes: "Follow-up consultation"
  },
  {
    id: "3",
    doctorName: "Dr. Fatima Ibrahim",
    specialty: "Pediatrician",
    facilityName: "EKO Hospital",
    date: "2026-04-28",
    time: "11:00 AM",
    type: "in-person",
    status: "completed",
  },
  {
    id: "4",
    doctorName: "Dr. Chidi Eze",
    specialty: "Dermatologist",
    facilityName: "St. Nicholas Hospital",
    date: "2026-04-20",
    time: "10:00 AM",
    type: "phone",
    status: "cancelled",
  },
];

function getAppointmentIcon(type: Appointment["type"]) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
  }
}

function getStatusColor(status: Appointment["status"]) {
  switch (status) {
    case "upcoming":
      return "bg-primary/10 text-primary";
    case "completed":
      return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "cancelled":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusIcon(status: Appointment["status"]) {
  switch (status) {
    case "upcoming":
      return <Clock className="h-3 w-3" />;
    case "completed":
      return <CalendarCheck className="h-3 w-3" />;
    case "cancelled":
      return <CalendarX className="h-3 w-3" />;
    default:
      return null;
  }
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const isPast = new Date(appointment.date) < new Date();
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      isPast && appointment.status === "upcoming" && "border-amber-500/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Doctor Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{appointment.doctorName}</h3>
                <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(appointment.date).toLocaleDateString("en-NG", { 
                  weekday: "short",
                  month: "short", 
                  day: "numeric",
                  year: "numeric"
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{appointment.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{appointment.facilityName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getAppointmentIcon(appointment.type)}
                <span className="capitalize">{appointment.type === "in-person" ? "In Person" : appointment.type}</span>
              </div>
            </div>

            {appointment.notes && (
              <p className="text-sm text-muted-foreground italic">
                Note: {appointment.notes}
              </p>
            )}
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-end gap-2">
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize",
              getStatusColor(appointment.status)
            )}>
              {getStatusIcon(appointment.status)}
              {appointment.status}
            </span>
            
            {appointment.status === "upcoming" && (
              <Button variant="ghost" size="sm" className="gap-1">
                Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const filteredAppointments = MOCK_APPOINTMENTS.filter((apt) => {
    const matchesSearch = 
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && apt.status === activeTab;
  });

  const upcomingCount = MOCK_APPOINTMENTS.filter(a => a.status === "upcoming").length;
  const completedCount = MOCK_APPOINTMENTS.filter(a => a.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
            <p className="text-muted-foreground">Manage your healthcare appointments</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingCount}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <CalendarCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-initial">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-initial">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 sm:flex-initial">
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 font-medium text-foreground">No appointments found</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    {searchQuery 
                      ? "Try adjusting your search" 
                      : `You don't have any ${activeTab === "all" ? "" : activeTab} appointments`}
                  </p>
                  {activeTab === "upcoming" && (
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Book Your First Appointment
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
