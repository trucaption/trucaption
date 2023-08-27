import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

export default function AppMenuItem({ disabled, onClick, icon, text }) {
  return (
    <ListItem key="Download" disablePadding>
      <ListItemButton disabled={disabled} onClick={onClick}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText>{text}</ListItemText>
      </ListItemButton>
    </ListItem>
  );
}
