import React, { useEffect, useState } from "react";
import KanbanBoard from "../components/KanbanBoard";
import { useLocation } from "react-router-dom";
import { useStateContext } from "../context";

const ScreeningSchedule = () => {
  const location = useLocation();
  const { records } = useStateContext();
  const [kanbanData, setKanbanData] = useState(null);

  useEffect(() => {
    // If data is passed directly through navigation
    if (location.state) {
      setKanbanData(location.state);
    } else {
      // If no direct navigation data, try to find records with kanban data
      const recordsWithKanban = records.filter(
        (record) => record.kanbanRecords && record.kanbanRecords.trim() !== ""
      );
      
      if (recordsWithKanban.length > 0) {
        try {
          // Use the most recent record with kanban data
          const latestRecord = recordsWithKanban[recordsWithKanban.length - 1];
          const parsedKanban = JSON.parse(latestRecord.kanbanRecords);
          setKanbanData(parsedKanban);
        } catch (error) {
          console.error("Error parsing kanban data:", error);
        }
      }
    }
  }, [location.state, records]);

  if (!kanbanData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          No treatment plans available. Please generate a treatment plan from a medical record first.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-scroll">
      <KanbanBoard state={{ state: kanbanData }} />
    </div>
  );
};

export default ScreeningSchedule;
