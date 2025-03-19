import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import Paper from '@mui/material/Paper';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import DeployTriggerButton from './DeployTriggerButton';
import { Box, TextField } from '@mui/material';

const DeployView = () => {
  const paginationModel = {page:0, pageSize:20};
  const [searchText, setSearchText] = useState('');
  const [argoApps, setArgoApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { field:'name', headerName:"이름", width:400, renderCell:(params)=>{
      return(
        <Link
          to={`/deploy/${params.row.name}`}
          style={{ textDecoration: 'none', color:'inherit'}}
        >
          {params.value}
        </Link>
        )
    }},
    { field:'project', headerName:"Project",},
    { field:'healthStatus', headerName:"배포 상태", width:150,renderCell:(params)=>{
        let chipColor = 'default';
        if (params.value ==='Healthy'){
          chipColor = 'primary';
        } else if(params.value === 'Missing'){
          chipColor = 'error';
        } else if(params.value === 'Progressing'){
          chipColor = 'warning';
        }
        return <Chip label={params.value} color={chipColor} variant='outlined' />
    }},
    { field:'syncStatus', headerName:"동기화(Sync)", width:150,renderCell:(params)=>{
      let chipColor = 'default';
      if (params.value ==='Synced'){
        chipColor = 'primary';
      } else if(params.value === 'OutOfSync'){
        chipColor = 'error';
      }
      return <Chip label={params.value} color={chipColor} variant='outlined' />
    }},
    { field:'manualSync', headerName:"배포 수행",
      width: 250,
      renderCell: (params)=>{
        return(
          <DeployTriggerButton
            appName={params.row.name}
          />
        )
      }
    }
  ];

  // !
  // ! 검색창
  // !
  const filteredApps = useMemo(() => {
    return argoApps.filter((app)=>
      app.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [argoApps, searchText]);

  // !
  // ! 초기 데이터
  // !
  // 백엔드에서 데이터를 가져옵니다.
  const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
    ? window._env_.REACT_APP_BACKEND_URL
    : process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
    axios.get(`${backendUrl}/argocd`)
    .then(response => {
      setArgoApps(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error(`Error fetching argocd app lists:`, error)
      setError(error);
      setLoading(false);
    })
  }, []);

  return (
    <Paper>
      <Box>
        <TextField
          label="Search App Name"
          variant='outlined'
          value={searchText}
          onChange={(e)=> setSearchText(e.target.value)}
        />
      </Box>
      <DataGrid
        rows={filteredApps}
        columns={columns}
        getRowId={(row)=> row.name}
        initialState={{pagination: {paginationModel}}}
        pageSizeOptions={[5,10]}
        checkboxSelection
      >
      </DataGrid>
    </Paper>
  );
};

export default DeployView;
