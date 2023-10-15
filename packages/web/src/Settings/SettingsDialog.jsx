import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
} from "@mui/material";

import { useTranslation } from "react-i18next";

export default function SettingsDialog({
  configType,
  open,
  onCancel,
  onSave,
  children,
  title,
}) {
  const { t } = useTranslation();

  return (
    <Dialog scroll="paper" open={open[configType]} onClose={null}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="standard">
          {children}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t("dialog.cancel")}</Button>
        <Button onClick={onSave}>{t("dialog.save")}</Button>
      </DialogActions>
    </Dialog>
  );
}
