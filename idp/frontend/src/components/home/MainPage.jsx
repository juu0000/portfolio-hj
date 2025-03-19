import React, { useEffect, useState } from 'react';
import BuildView from '../build/BuildView';
import DeployView from '../deploy/DeployView';
import Box from '@mui/material/Box';

import './MainPage.css';
import { AppBar, appBarClasses, Button, createTheme, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography} from '@mui/material';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

const Header = () => {
  return (
    <AppBar position='fixed'>
      <Toolbar>
        <Link to="/build" style={{textDecoration: 'none', color:'inherit'}} >
          <Typography variant='h6'
                      to="/build"
                      sx={{ flexGrow:1, 
                          }}
          >
          IDP Platform
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
}

const Nav = () => {
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(()=>{
    // 경로가 '/deploy'로 시작하면 index 1, 아니면 0으로 설정
    if (location.pathname.startsWith('/deploy')){
      setSelectedIndex(1);
    } else {
      setSelectedIndex(0);
    }
  }, [location.pathname]);

  const handleListItemClick = (event,index)=>{
    setSelectedIndex(index);
  };

  return (
    <Drawer 
      variant='permanent'
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', mt: '64px'}
    }}>
      <List>
        <ListItemButton
          component={Link} to="/build"
          selected={selectedIndex===0}
          onClick={(event) => handleListItemClick(event,0)}
        >
          <ListItemText primary="Build"></ListItemText>
        </ListItemButton>
        <ListItemButton
          component={Link} to="/deploy"
          selected={selectedIndex===1}
          onClick={(event)=> handleListItemClick(event,1)}
        >
          <ListItemText primary="Deploy"></ListItemText>
        </ListItemButton>
      </List>
    </Drawer>
  );
}

const Content = () => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        mt: '65px',
      }}
    >
      <Outlet></Outlet>
    </Box>
  );
}

const MainPage = () => {

  return (
    <Box sx={{ display: 'flex'}}>
      <Header></Header>
      <Nav></Nav>
      <Content></Content>
    </Box>
  );

};

export default MainPage;
