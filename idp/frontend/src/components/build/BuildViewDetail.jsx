import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import BuildTriggerButton from './BuildTriggerButton';

// TabPanel: 각 탭의 내용을 조건부로 렌더링
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// 시간 및 지속시간 포맷팅 함수
const formatTime = (millis) => new Date(millis).toLocaleString();
const formatDuration = (durationMillis) =>
  (durationMillis / 1000).toFixed(1) + "s";


const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
  ? window._env_.REACT_APP_BACKEND_URL
  : process.env.REACT_APP_BACKEND_URL;
// BuildExecutionDetailTabs: 빌드 상태(스테이지)와 빌드 로그를 탭으로 분리하여, RUNNING일 경우 SSE 사용, 아니면 GET 방식으로 데이터 가져오기
const BuildExecutionDetailTabs = ({ jobId, build, onBuildUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [statusData, setStatusData] = useState(build);
  const [logData, setLogData] = useState(build.log || "");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // GET 방식으로 데이터 가져오는 함수들
  const refreshStatus = () => {
    axios
      .get(`${backendUrl}/jenkins/job/${jobId}/build/${build.name.replace('#','')}/status`)
      .then((response) => {
        const data = response.data;
        setStatusData(data);
        if (onBuildUpdate) onBuildUpdate(data);
      })
      .catch((err) => {
        console.error("Error refreshing build status:", err);
      });
  };

  const refreshLog = () => {
    axios
      .get(`${backendUrl}/jenkins/job/${jobId}/build/${build.name.replace('#','')}/log`, { responseType: 'text' })
      .then((response) => {
        setLogData(response.data);
      })
      .catch((err) => {
        console.error("Error refreshing build log:", err);
      });
  };

  // SSE 연결 생성 함수 (빌드 상태)
  const createStatusSSE = () => {
    const url = `${backendUrl}/jenkins/job/status?jobName=${encodeURIComponent(jobId)}&buildNumber=${build.name.replace('#','')}`;
    const eventSource = new EventSource(url);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatusData(data);
        if (onBuildUpdate) onBuildUpdate(data);
      } catch (e) {
        console.error("SSE status parse error:", e);
      }
    };
    eventSource.onerror = (err) => {
      console.error("SSE status error:", err);
      eventSource.close();
    };
    return eventSource;
  };

  // SSE 연결 생성 함수 (빌드 로그)
  const createLogSSE = () => {
    const url = `${backendUrl}/jenkins/job/log?jobName=${encodeURIComponent(jobId)}&buildNumber=${build.name.replace('#','')}`;
    const eventSource = new EventSource(url);
    eventSource.onmessage = (event) => {
      setLogData(event.data);
    };
    eventSource.onerror = (err) => {
      console.error("SSE log error:", err);
      eventSource.close();
    };
    return eventSource;
  };

  // 활성 탭에 따라 적절한 방식으로 데이터 가져오기
  useEffect(() => {
    let eventSource = null;
    if (build.status === "IN_PROGRESS") {
      // 진행중인 빌드는 SSE 방식 사용
      if (activeTab === 0) {
        eventSource = createStatusSSE();
      } else if (activeTab === 1) {
        eventSource = createLogSSE();
      }
    } else {
        if (activeTab === 0) {
          refreshStatus();
        } else if (activeTab === 1) {
          refreshLog();
        }
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [activeTab, jobId, build.name, build.status]);

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Build {build.name} Details</Typography>
      </Box>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Build Stages" />
        <Tab label="Context Log" />
      </Tabs>
      {activeTab === 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Build Stages:</Typography>
          <List dense>
            {statusData.stages &&
              statusData.stages.map((stage, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${stage.name} - ${stage.status}`}
                    secondary={stage.durationMillis ? `Duration: ${formatDuration(stage.durationMillis)}` : ""}
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      )}
      {activeTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Context Log:</Typography>
          <Paper sx={{ p: 2, backgroundColor: "#f5f5f5", maxHeight: 2000, overflow: "auto" }}>
            <Typography variant="body2" component="pre">
              {logData || "Context log 정보가 없습니다."}
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};

// BuildDetailPage: 전체 페이지 컴포넌트
const BuildDetailPage = () => {
  const { jobId } = useParams(); // URL에서 jobId 추출
  const [buildList, setBuildList] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  // 페이지 진입 시, 빌드 히스토리 엔드포인트 호출하여 buildList 구성
  const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
    ? window._env_.REACT_APP_BACKEND_URL
    : process.env.REACT_APP_BACKEND_URL;
  useEffect(() => {
    axios.get(`${backendUrl}/jenkins/job/${jobId}/build/history`)
      .then((response) => {
        setBuildList(response.data);
        setSelectedTab(0);
      })
      .catch((err) => {
        console.error("Error fetching build history:", err);
      });
  }, [jobId]);

  const updateBuildInList = (updatedBuild) => {
    setBuildList((prev) =>
      prev.map((b, index) => (index === selectedTab ? updatedBuild : b))
    );
  };

  return (
    <Box>
      {/* 상단 영역: Job 이름은 왼쪽, 빌드 시작 버튼은 오른쪽 */}
      <Box sx={{ display: 'flex', alignItems: 'center', m: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ textAlign: 'left' }}>
            Job: {jobId}
          </Typography>
        </Box>
        <BuildTriggerButton
          jobName={jobId}
          hasParams={false}
          onStatusUpdate={(data) => {
            console.log("빌드 트리거 후 응답:", data);
            setTimeout(() => {
              console.log("새로고침 시도");
              window.location.reload();
            }, 10000);
          }}
        />
      </Box>
      
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {buildList.map((build, index) => (
          <Tab key={build.id} label={`${build.name} - ${build.status}`} />
        ))}
      </Tabs>
      {buildList.map((build, index) => (
        <TabPanel key={build.id} value={selectedTab} index={index}>
          <BuildExecutionDetailTabs jobId={jobId} build={build} onBuildUpdate={updateBuildInList} />
        </TabPanel>
      ))}
      <Divider sx={{ my: 3 }} />
    </Box>
  );
};

export default BuildDetailPage;
