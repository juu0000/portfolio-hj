import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import { Box, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import BuildTriggerButton from './BuildTriggerButton';
import { Link } from 'react-router-dom';

const BuildView = () => {
  const paginationModel = {page:0, pageSize: 20};
  const [searchText, setSearchText] = useState('');
  const [jenkinsJobs, setJenkinsJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // !
  // ! 테이블 열
  // !
  const columns = [
    {field:'name', headerName:"이름", width:400, renderCell:(params)=>{
      return(
        <Link
          to={`/build/${params.row.name}`}
          style={{ textDecoration: 'none', color:'inherit'}}
        >
          {params.value}
        </Link>
        )
    }},
    {field:'lastSuccessfulbuildTime', headerName:"마지막 빌드 성공 시간",
      width:200,
      renderCell: (params) =>{
        if (params.row.lastSuccessfulBuild){
          const timestamp = params.row.lastSuccessfulBuild.timestamp;
          const data = new Date(timestamp);
          return data.toLocaleString();
        }
        return `-`;
      }
    },
    {field:'lastFailedbuildTime', headerName:"마지막 빌드 실패 시간",
      width:200,
      renderCell: (params) =>{
        if (params.row.lastFailedBuild){
          const timestamp = params.row.lastFailedBuild.timestamp;
          const data = new Date(timestamp);
          return data.toLocaleString();
        }
        return `-`;
      }
    },
    {field:'buildDuration', headerName:"마지막 빌드 소요 시간",
      width:200,
      renderCell: (params) =>{
        if (params.row.lastSuccessfulBuild){
          const duration = params.row.lastSuccessfulBuild.duration;
          const durationInSeconds = (duration / 1000).toFixed(1);
          return `${durationInSeconds}초`
        }
        return `-`;
      }
    },
    {field:'color', headerName:"마지막 빌드 성공", width:120, renderCell: (params) =>{
      let chipColor = 'default';
      if ( params.value === 'blue') {
        chipColor = 'primary';
      } else if(params.value === 'red'){
        chipColor = 'error';
      } else if(params.value === 'yellow'){
        chipColor = 'warning';
      }
      return <Chip label={params.value} color={chipColor} variant='outlined' />
    }},
    {field: 'trigger', headerName:"빌드 수행",
      width: 250,
      renderCell: (params) =>{
        return (
          <BuildTriggerButton
            jobName={params.row.name}
            hasParams={params.row.hasParameters}
          />
        );
      }
    }
  ];

  // !
  // ! 검색창
  // !
  const filteredJobs = useMemo(() => {
    return jenkinsJobs.filter((job)=>
      job.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [jenkinsJobs, searchText]);

  // !
  // ! 초기 데이터
  // !
  // 백엔드에서 데이터를 가져옵니다.
  const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
    ? window._env_.REACT_APP_BACKEND_URL
    : process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
      axios.get(`${backendUrl}/jenkins`)
      .then(response => {
        setJenkinsJobs(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(`Error fetching jenkins jobs:`, error);
        setError(error);
        setLoading(false);
      })
  }, []);

  return (
    <Paper>
      {/* 검색 텍스트 박스 */}
      <Box>
        <TextField
          label="Search Job Name"
          variant='outlined'
          value={searchText}
          onChange={(e)=> setSearchText(e.target.value)}
        />
      </Box>
      {/* 필터링된 데이터를 DataGrid에 전달 */}
      {/* 테이블 */}
      <DataGrid
        rows={filteredJobs}
        columns={columns}
        getRowId={(row)=> row.name}
        initialState={{pagination: {paginationModel}}}
        pageSizeOptions={[5,10]}
        loading={loading}
        checkboxSelection
      >
      </DataGrid>
    </Paper>
  );
};

export default BuildView;
