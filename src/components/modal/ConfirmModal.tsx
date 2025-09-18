'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Loader2} from "lucide-react"

interface ActionModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    loading?: boolean
    confirmVariant?: "default" | "destructive" | "outline" | "secondary"
    onConfirm: () => void
}

export default function ActionModal({
                                        open,
                                        setOpen,
                                        title,
                                        description,
                                        confirmLabel = "Confirm",
                                        loading = false,
                                        confirmVariant = "destructive",
                                        onConfirm,
                                    }: ActionModalProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex items-center justify-center"
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
