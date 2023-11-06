import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import React, {useRef, useState} from "react";
import {AccountCircle} from "@mui/icons-material";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {entityType} from "../App";
import {capitalize} from "../utils";
import {useNavigate} from "react-router-dom";

const drawerWidth = 240;

export default function Navigation() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLoginClose = () => setLoginOpen(false);

    const processLogin = () => {
        const email = emailRef.current!.value;
        const password = passwordRef.current!.value;
        if (!email || !password) return;

        fetch("http://127.0.0.1:8000/api/v0/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        }).then(r => {
            if(r.status === 200) {
                r.json().then(j => {
                    // process response
                });
            }
            handleLoginClose();
        });
    };

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>TODO: TITLE</Typography>
            </Toolbar>
            <Divider />
                <List>
                    <ListItem key="Categories" disablePadding>
                        <ListItemButton onClick={() => {navigate("/categories"); setMobileOpen(false);}}>
                            <ListItemIcon>
                                <CategoryIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Categories"/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="Products" disablePadding>
                        <ListItemButton onClick={() => {navigate("/products"); setMobileOpen(false);}}>
                            <ListItemIcon>
                                <InventoryIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Products"/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem key="Orders" disablePadding>
                        <ListItemButton onClick={() => {navigate("/orders"); setMobileOpen(false);}}>
                            <ListItemIcon>
                                <ListAltIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Orders"/>
                        </ListItemButton>
                    </ListItem>
                </List>
        </div>
    );

    const loginDialog = (
        <Dialog open={Boolean(loginOpen)} onClose={handleLoginClose}>
            <DialogTitle>Log in</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Email Address" type="email" fullWidth variant="standard" inputRef={emailRef}/>
                <TextField margin="dense" label="Password" type="password" fullWidth variant="standard" inputRef={passwordRef}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleLoginClose}>Cancel</Button>
                <Button onClick={processLogin}>Log in</Button>
            </DialogActions>
        </Dialog>
    );

    return (<>
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon onClick={handleDrawerToggle}/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>{capitalize(entityType.value)}</Typography>
                    <IconButton size="large" onClick={handleMenu} color="inherit">
                        <AccountCircle />
                    </IconButton>
                    <Menu anchorEl={anchorEl} anchorOrigin={{vertical: 'top', horizontal: 'right'}} keepMounted
                          transformOrigin={{vertical: 'top', horizontal: 'right'}} open={Boolean(anchorEl)}
                          onClose={handleClose}>
                          <MenuItem disabled={true}>Hi, {"TODO: NAME"}</MenuItem>
                          <MenuItem onClick={() => {handleClose();}}>Log out</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </Box>

        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
            <Drawer container={() => window.document.body} variant="temporary" open={mobileOpen}
                    onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
                    sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }}}>
                {drawer}
            </Drawer>
        </Box>

        {loginDialog}
    </>);
}