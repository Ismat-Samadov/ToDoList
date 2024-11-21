// src/components/tasks/TaskItem.tsx
import { Task } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { logUserActivity } from '@/lib/logging';

interface TaskItemProps {
 task: Task;
 onStatusChange: (id: string, status: string) => void;
}

export default function TaskItem({ task, onStatusChange }: TaskItemProps) {
 const { data: session } = useSession();

 const handleStatusChange = async (id: string, newStatus: string) => {
   onStatusChange(id, newStatus);
   
   await logUserActivity({
     userId: session?.user?.id as string,
     action: 'STATUS_CHANGE',
     metadata: {
       taskId: id,
       oldStatus: task.status,
       newStatus,
       timestamp: new Date().toISOString()
     }
   });
 };

 return (
   <div className="bg-white p-4 rounded-lg shadow">
     <div className="flex justify-between items-start mb-2">
       <h3 className="font-semibold">{task.title}</h3>
       <span className={`px-2 py-1 rounded text-sm ${
         task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
         task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
         'bg-green-100 text-green-800'
       }`}>
         {task.priority}
       </span>
     </div>
     
     <p className="text-gray-600 text-sm mb-2">{task.description}</p>
     
     {task.dueDate && (
       <p className="text-sm text-gray-500 mb-2">
         Due: {new Date(task.dueDate).toLocaleDateString()}
       </p>
     )}
     
     <select
       value={task.status}
       onChange={(e) => handleStatusChange(task.id, e.target.value)}
       className="w-full px-2 py-1 border rounded text-sm"
     >
       <option value="PENDING">Pending</option>
       <option value="IN_PROGRESS">In Progress</option>
       <option value="COMPLETED">Completed</option>
     </select>
   </div>
 );
}