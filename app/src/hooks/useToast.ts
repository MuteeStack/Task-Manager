import { toast } from 'sonner';

export function useToast() {
  const success = (title: string, description?: string) => {
    toast.success(title, {
      description,
      duration: 4000,
      className: 'border-l-[3px] border-l-[#22c55e]',
    });
  };

  const error = (title: string, description?: string) => {
    toast.error(title, {
      description,
      duration: 5000,
      className: 'border-l-[3px] border-l-[#ef4444]',
    });
  };

  const info = (title: string, description?: string) => {
    toast.info(title, {
      description,
      duration: 4000,
      className: 'border-l-[3px] border-l-[#8b5cf6]',
    });
  };

  const warning = (title: string, description?: string) => {
    toast.warning(title, {
      description,
      duration: 4000,
      className: 'border-l-[3px] border-l-[#f59e0b]',
    });
  };

  const dismiss = (id?: string) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  return { success, error, info, warning, dismiss };
}
