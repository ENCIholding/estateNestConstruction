import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BellRing, TriangleAlert } from "lucide-react";
import ManagementLayout from "@/components/management/ManagementLayout";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildWarrantyReminders,
  fetchManagementProjects,
  formatDate,
} from "@/lib/managementData";

export default function ManagementWarrantyReminder() {
  const {
    data: projects = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ["management-projects"],
    queryFn: fetchManagementProjects,
  });

  const reminders = useMemo(() => buildWarrantyReminders(projects), [projects]);

  return (
    <ManagementLayout currentPageName="warranty-reminder">
      <div className="space-y-6">
        <div className="dashboard-panel overflow-hidden p-8">
          <div className="absolute inset-y-0 right-0 w-44 bg-gradient-to-l from-enc-yellow/10 via-enc-orange/10 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-enc-orange">
              Follow-up Reminders
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Warranty Reminder</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              These reminders are derived from recorded warranty start dates only. They help the team plan follow-up outreach, but they do not replace the actual warranty terms for each project.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Tracked reminders</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {reminders.filter((item) => item.status !== "missing").length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Due within 60 days</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {reminders.filter((item) => item.status === "review-soon").length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Past due review</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {reminders.filter((item) => item.status === "review-due").length}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-panel p-2">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">Missing warranty date</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {reminders.filter((item) => item.status === "missing").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading warranty reminders...
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="dashboard-panel p-2">
            <CardContent className="flex items-start gap-3 p-6 text-sm leading-6 text-muted-foreground">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              Warranty reminders could not be loaded from the management API.
            </CardContent>
          </Card>
        ) : (
          <Card className="dashboard-panel p-2">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">Recorded follow-up dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.length ? (
                reminders.map((reminder) => (
                  <div key={reminder.projectId} className="dashboard-item p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{reminder.projectName}</p>
                          <Badge
                            className={
                              reminder.status === "review-due"
                                ? "rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300"
                                : reminder.status === "review-soon"
                                  ? "rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                  : reminder.status === "tracked"
                                    ? "rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                    : "rounded-full bg-muted text-muted-foreground"
                            }
                          >
                            {reminder.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Recorded start: {formatDate(reminder.recordedStartDate)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Annual follow-up review: {formatDate(reminder.anniversaryDate)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <BellRing className="h-4 w-4 text-enc-orange" />
                          <span className="font-medium text-foreground">Reminder</span>
                        </div>
                        <p className="mt-2">
                          {reminder.daysUntilReview === null
                            ? "Warranty start date still needs to be recorded."
                            : reminder.daysUntilReview < 0
                              ? `${Math.abs(reminder.daysUntilReview)} day(s) past the annual follow-up date.`
                              : `${reminder.daysUntilReview} day(s) until the annual follow-up date.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-item p-6 text-sm leading-6 text-muted-foreground">
                  No warranty reminder records are available yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}
