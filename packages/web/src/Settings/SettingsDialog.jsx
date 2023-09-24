import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
} from "@mui/material";

export default function SettingsDialog({
  configType,
  open,
  onCancel,
  onSave,
  children,
  title,
}) {
  return (
    <Dialog scroll="paper" open={open[configType]} onClose={null}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="standard">
          {children}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
