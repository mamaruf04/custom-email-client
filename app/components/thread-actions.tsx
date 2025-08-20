'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { moveEmailAction, deleteEmailAction } from '@/lib/email/actions';
import { useEmail } from '@/app/contexts/email-context';
import { Archive, Check, Clock, Trash2 } from 'lucide-react';
import { useActionState } from 'react';

interface ThreadActionsProps {
  threadId: string;
  folderName?: string;
  uid?: number;
}

export function ThreadActions({ threadId, folderName = 'INBOX', uid }: ThreadActionsProps) {
  const { credentials } = useEmail();
  
  const initialState = {
    error: null,
    success: false,
  };

  const [moveState, moveAction, movePending] = useActionState(
    moveEmailAction,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteEmailAction,
    initialState,
  );

  const handleMoveAction = async (formData: FormData) => {
    if (!credentials || !uid) {
      return;
    }

    formData.append('userEmail', credentials.email);
    formData.append('userPassword', credentials.password);
    formData.append('folder', folderName);
    formData.append('uid', uid.toString());
    formData.append('targetFolder', 'Archive');

    await moveAction(formData);
  };

  const handleDeleteAction = async (formData: FormData) => {
    if (!credentials || !uid) {
      return;
    }

    formData.append('userEmail', credentials.email);
    formData.append('userPassword', credentials.password);
    formData.append('folder', folderName);
    formData.append('uid', uid.toString());

    await deleteAction(formData);
  };

  if (!credentials) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <form action={handleMoveAction}>
              <button
                type="submit"
                disabled={movePending}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={14} className="text-gray-600" />
              </button>
            </form>
          </TooltipTrigger>
          <TooltipContent>
            <p>Archive email</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clock size={14} className="text-gray-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is not yet implemented</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <form action={handleDeleteAction}>
              <button
                type="submit"
                disabled={deletePending}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} className="text-gray-600" />
              </button>
            </form>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete email</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
