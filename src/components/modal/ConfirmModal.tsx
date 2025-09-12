"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";

interface ConfirmModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    loading?: boolean;
    onConfirm: () => void;
}

export default function ConfirmModal({
                                         open,
                                         setOpen,
                                         title,
                                         description,
                                         confirmLabel = "Confirm",
                                         loading = false,
                                         onConfirm,
                                     }: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="space-x-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700">
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
