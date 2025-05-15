import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconAlertCircle,
  IconCircleDashedCheck,
  IconFolder,
  IconHourglassHigh,
  IconUserScan,
} from "@tabler/icons-react";
import { usePrivy } from "@privy-io/react-auth";
import MetricsCard from "./MetricsCard";
import { useStateContext } from "../context";

const DisplayInfo = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { fetchUserRecords, records, fetchUserByEmail } = useStateContext();
  const [metrics, setMetrics] = useState({
    totalFolders: 0,
    aiPersonalizedTreatment: 0,
    totalScreenings: 0,
    completedScreenings: 0,
    pendingScreenings: 0,
    overdueScreenings: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserByEmail(user.email.address)
        .then(() => {
          const totalFolders = records.length;
          let aiPersonalizedTreatment = 0;
          let totalScreenings = 0;
          let completedScreenings = 0;
          let pendingScreenings = 0;
          let overdueScreenings = 0;

          records.forEach((record) => {
            if (record.kanbanRecords && record.kanbanRecords.trim() !== "") {
              try {
                const kanban = JSON.parse(record.kanbanRecords);
                
                // Count tasks in each column
                if (kanban.tasks && Array.isArray(kanban.tasks)) {
                  totalScreenings += kanban.tasks.length;
                  
                  kanban.tasks.forEach(task => {
                    switch (task.columnId) {
                      case "done":
                        completedScreenings++;
                        break;
                      case "doing":
                        pendingScreenings++;
                        break;
                      case "todo":
                        overdueScreenings++;
                        break;
                    }
                  });
                }

                // Check if this record has AI treatment
                if (record.analysisResult && record.analysisResult.trim() !== "") {
                  aiPersonalizedTreatment++;
                }
              } catch (error) {
                console.error("Failed to parse kanbanRecords for record:", record.id, error);
              }
            }
          });

          setMetrics({
            totalFolders,
            aiPersonalizedTreatment,
            totalScreenings,
            completedScreenings,
            pendingScreenings,
            overdueScreenings,
          });
        })
        .catch((e) => {
          console.error("Error fetching user data:", e);
        });
    }
  }, [user, fetchUserRecords, records, fetchUserByEmail]);

  const metricsData = [
    {
      title: "Specialist Appointments Pending",
      subtitle: "View",
      value: metrics.pendingScreenings,
      icon: IconHourglassHigh,
      onClick: () => navigate("/medical-records"),
    },
    {
      title: "Treatment Progress Update",
      subtitle: "View",
      value: `${metrics.completedScreenings} of ${metrics.totalScreenings}`,
      icon: IconCircleDashedCheck,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Total Records",
      subtitle: "View",
      value: metrics.totalFolders,
      icon: IconFolder,
      onClick: () => navigate("/medical-records"),
    },
    {
      title: "Total Screenings",
      subtitle: "View",
      value: metrics.totalScreenings,
      icon: IconUserScan,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Completed Screenings",
      subtitle: "View",
      value: metrics.completedScreenings,
      icon: IconCircleDashedCheck,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Pending Screenings",
      subtitle: "View",
      value: metrics.pendingScreenings,
      icon: IconHourglassHigh,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Todo Screenings",
      subtitle: "View",
      value: metrics.overdueScreenings,
      icon: IconAlertCircle,
      onClick: () => navigate("/screening-schedules"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-[26px]">
      <div className="mt-7 grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2">
        {metricsData.slice(0, 2).map((metric) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="mt-[9px] grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {metricsData.slice(2).map((metric) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default DisplayInfo;
