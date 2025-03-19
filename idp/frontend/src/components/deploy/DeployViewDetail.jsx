import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { useParams } from 'react-router-dom';
import DeployTriggerButton from './DeployTriggerButton';

// TabPanel: 각 탭의 내용을 조건부로 렌더링
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DeployViewDetailDummy = () => {
  const { appName } = useParams();
  // 기본 탭 순서를 "Status", "Resources", "Error Logs", "Overview", "History"로 설정
  const [selectedTab, setSelectedTab] = useState(0);
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const formatDateTime = (dateString) =>
    new Date(dateString).toLocaleString();

  useEffect(() => {
    if (!appName) return; // appName이 없는 경우 처리
    const backendUrl = window._env_ && window._env_.REACT_APP_BACKEND_URL
      ? window._env_.REACT_APP_BACKEND_URL
      : process.env.REACT_APP_BACKEND_URL;
    axios
      .get(`${backendUrl}/argocd/app/${appName}/filtered`)
      .then((response) => {
        setAppData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [appName]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }
  if (!appData) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">No data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* 헤더: 앱 이름 및 배포 버튼 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">
            Application: {appData.metadata.name}
          </Typography>
          <Typography variant="subtitle1">
            Namespace: {appData.metadata.namespace}
          </Typography>
        </Box>
        <DeployTriggerButton appName={appName} />
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Status" />
          <Tab label="Resources" />
          <Tab label="Error Logs" />
          <Tab label="Overview" />
          <Tab label="History" />
        </Tabs>

        {/* Status 탭 */}
        <TabPanel value={selectedTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Application Status
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Sync Status"
                secondary={appData.status.sync.status}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Revision"
                secondary={appData.status.sync.revision}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Health Status"
                secondary={appData.status.health.status}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Last Sync"
                secondary={
                  appData.status.reconciledAt
                    ? formatDateTime(appData.status.reconciledAt)
                    : "N/A"
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Operation Phase"
                secondary={appData.status?.operationState?.phase || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Operation Message"
                secondary={appData.status?.operationState?.message || "N/A"}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Images"
                secondary={appData.status.summary.images.join(', ')}
              />
            </ListItem>
          </List>
        </TabPanel>

        {/* Resources 탭 */}
        <TabPanel value={selectedTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Resources
          </Typography>
          <List dense>
            {appData.status.resources &&
              appData.status.resources.map((resource, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${resource.kind}: ${resource.name}`}
                    secondary={`Namespace: ${resource.namespace} / Status: ${resource.status} / Health: ${resource.health.status}`}
                  />
                </ListItem>
              ))}
          </List>
        </TabPanel>

        {/* Error Logs 탭 */}
        <TabPanel value={selectedTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Error Logs
          </Typography>
          {appData.status.conditions && appData.status.conditions.length > 0 ? (
            <List dense>
              {appData.status.conditions.map((condition, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={condition.type}
                    secondary={`${condition.message} (at ${formatDateTime(
                      condition.lastTransitionTime
                    )})`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No error logs available.</Typography>
          )}
        </TabPanel>

        {/* Overview 탭 */}
        <TabPanel value={selectedTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Overview
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Name" secondary={appData.metadata.name} />
            </ListItem>
            <ListItem>
              <ListItemText primary="UID" secondary={appData.metadata.uid} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Created At"
                secondary={formatDateTime(appData.metadata.creationTimestamp)}
              />
            </ListItem>
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Specification
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Repo URL"
                secondary={appData.spec.source.repoURL}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Path"
                secondary={appData.spec.source.path}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Target Revision"
                secondary={appData.spec.source.targetRevision}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Destination Namespace"
                secondary={appData.spec.destination.namespace}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Project"
                secondary={appData.spec.project}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Sync Options"
                secondary={appData.spec.syncPolicy.syncOptions.join(', ')}
              />
            </ListItem>
          </List>
        </TabPanel>

        {/* History 탭 */}
        <TabPanel value={selectedTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Deployment History
          </Typography>
          {appData.status.history && appData.status.history.length > 0 ? (
            <List dense>
              {appData.status.history.map((entry, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Revision: ${entry.revision}`}
                    secondary={`Deployed At: ${formatDateTime(
                      entry.deployedAt
                    )} by ${entry.initiatedBy.username}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No deployment history available.</Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DeployViewDetailDummy;
