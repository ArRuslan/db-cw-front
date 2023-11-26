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
import PeopleIcon from '@mui/icons-material/People';
import MemoryIcon from '@mui/icons-material/Memory';
import CodeIcon from '@mui/icons-material/Code';
import BarChartIcon from '@mui/icons-material/BarChart';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AssistantIcon from '@mui/icons-material/Assistant';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {capitalize} from "../utils";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../redux/store";
import {setAuthToken} from "../redux/accountState";
import {enqueueSnackbar} from "notistack";
import {entityTypes} from "../types/base_entity";
import {signal} from "@preact/signals-react";

const drawerWidth = 240;
export const navigationTitle = signal("");

export default function Navigation() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const token = useSelector((state: RootState) => state.account.token);
    const user = useSelector((state: RootState) => state.account.me);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

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
            if (r.status === 200) {
                r.json().then(j => {
                    dispatch(setAuthToken(j["token"]));
                    enqueueSnackbar(`Successfully logged in!`, {variant: "success"})
                });
            } else {
                r.json().then(j => {
                    enqueueSnackbar(`Failed to log in: ${j["detail"]}`, {variant: "error"})
                });
            }
        });
    };

    const icons = {
        categories: <CategoryIcon/>,
        products: <InventoryIcon/>,
        orders: <ListAltIcon/>,
        customers: <PeopleIcon/>,
        characteristics: <MemoryIcon/>,
        returns: <KeyboardReturnIcon/>,
    }

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>Store</Typography>
            </Toolbar>
            <Divider/>
            <List>
                {entityTypes.map(item => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton onClick={() => {
                            navigate(`/${item}`);
                            setMobileOpen(false);
                        }}>
                            <ListItemIcon>
                                {icons[item]}
                            </ListItemIcon>
                            <ListItemText primary={capitalize(item)}/>
                        </ListItemButton>
                    </ListItem>
                ))}

                <Divider/>

                <ListItem key="sql" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate("/sql");
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <CodeIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Sql console"/>
                    </ListItemButton>
                </ListItem>
                <ListItem key="statistics" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate("/statistics");
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <BarChartIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Statistics"/>
                    </ListItemButton>
                </ListItem>
                <ListItem key="reports" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate("/reports");
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <SummarizeIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Reports"/>
                    </ListItemButton>
                </ListItem>
                <ListItem key="recommendations" disablePadding>
                    <ListItemButton onClick={() => {
                        navigate("/price-rec");
                        setMobileOpen(false);
                    }}>
                        <ListItemIcon>
                            <AssistantIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Price recommendations"/>
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    const loginDialog = (
        <Dialog open={!Boolean(token)}>
            <DialogTitle>Log in</DialogTitle>
            <DialogContent>
                <TextField autoFocus margin="dense" label="Email Address" type="email" fullWidth variant="standard"
                           inputRef={emailRef}/>
                <TextField margin="dense" label="Password" type="password" fullWidth variant="standard"
                           inputRef={passwordRef}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={processLogin}>Log in</Button>
            </DialogActions>
        </Dialog>
    );

    return (<>
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}>
                        <MenuIcon onClick={handleDrawerToggle}/>
                    </IconButton>
                    <Typography variant="h6" component="div"
                                sx={{flexGrow: 1}}>{capitalize(navigationTitle.value)}</Typography>
                    <IconButton size="large" onClick={handleMenu} color="inherit">
                        <AccountCircle/>
                    </IconButton>
                    <Menu anchorEl={anchorEl} anchorOrigin={{vertical: 'top', horizontal: 'right'}} keepMounted
                          transformOrigin={{vertical: 'top', horizontal: 'right'}} open={Boolean(anchorEl)}
                          onClose={handleClose}>
                        <MenuItem disabled={true}>Hi, {user.first_name}</MenuItem>
                        <MenuItem onClick={() => {
                            dispatch(setAuthToken(null));
                            handleClose();
                        }}>Log out</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </Box>

        <Box component="nav" sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}>
            <Drawer container={() => window.document.body} variant="temporary" open={mobileOpen}
                    onClose={handleDrawerToggle} ModalProps={{keepMounted: true}}
                    sx={{'& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth}}}>
                {drawer}
            </Drawer>
        </Box>

        {loginDialog}
    </>);
}