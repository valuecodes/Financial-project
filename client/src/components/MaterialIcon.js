import React from 'react'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import LoopIcon from '@material-ui/icons/Loop';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';

export default function MaterialIcon({icon,color='black',size='large'}){

    switch(icon){
        case 'LoopIcon':
            return <LoopIcon fontSize={size} style={{color}}/>
        case 'ArrowForwardIosIcon':
            return <ArrowForwardIosIcon fontSize={size} style={{color}}/>
        case 'SettingsBackupRestoreIcon':
            return <SettingsBackupRestoreIcon fontSize={size} style={{color}}/>
        default: return null
    }
}
