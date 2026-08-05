"use client";
import { Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  /** Legacy prop: short item name shown in body */
  itemName?: string;
  /** Alternative prop: explicit dialog title */
  title?: string;
  /** Alternative prop: explicit description */
  description?: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function DeleteDialog({ itemName, title, description, onConfirm, trigger }: DeleteDialogProps) {
  const displayTitle = title ?? "Silmek istediğinizden emin misiniz?";
  const displayDesc  = description ?? (
    <><strong style={{ color: "var(--a-text)" }}>{itemName}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.</>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="destructive" size="sm" id={`delete-${itemName ?? "item"}`}>
            <Trash2 size={13} />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: "var(--a-text)" }}>
            {displayTitle}
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: "var(--a-muted)" }}>
            {displayDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel style={{ color: "var(--a-text)" }}>Vazgeç</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Sil</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteDialog;
