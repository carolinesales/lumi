// src/components/lumi/ConfirmDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel  = 'Confirmar',
  cancelLabel   = 'Cancelar',
  onConfirm,
  destructive   = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[30px] border-white/90 bg-white/95 shadow-2xl backdrop-blur-xl sm:max-w-[430px]">
        <DialogHeader>
          <div className="mb-2 grid size-12 place-items-center rounded-full bg-lumi-input text-lumi-black">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          </div>
          <DialogTitle className="font-['Montserrat'] text-[22px] font-medium tracking-[-0.05em]">
            {title}
          </DialogTitle>
          <DialogDescription className="font-nunito leading-6 text-lumi-secondary">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}