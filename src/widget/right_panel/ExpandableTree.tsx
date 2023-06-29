import React, { useState } from 'react';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

interface ExpandableItemProps {
  label: string;
  value: any;
  level?: number;
}

const ExpandableItem = ({ label, value, level = 0 }: ExpandableItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const icon = expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />;

  const indent = level * 16;

  if (typeof value === 'number') {
    return (
      <ListItem sx={{ marginLeft: indent + 'px', padding: '0px' }}>
        <ListItemIcon sx={{ minWidth: '24px' }} />
        <ListItemText primary={`${label}: ${value}`} />
      </ListItem>
    );
  }

  return (
    <>
      <ListItem
        button
        onClick={toggleExpanded}
        sx={{ marginLeft: indent + 'px', padding: '0px' }}
      >
        <ListItemIcon sx={{ minWidth: '24px' }}>{icon}</ListItemIcon>
        <ListItemText primary={label + `: array(${value.length})`} />
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(value).map(([key, val]) => (
            <ExpandableItem
              key={key}
              label={key}
              value={val}
              level={level + 1}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
};

export const ExpandableTree = (data: any) => {
  return (
    <List>
      {Object.entries(data).map(([key, value]) => (
        <ExpandableItem key={key} label={key} value={value} />
      ))}
    </List>
  );
};

export default ExpandableTree;
