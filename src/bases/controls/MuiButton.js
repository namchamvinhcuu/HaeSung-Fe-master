import React, { useImperativeHandle } from 'react'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { styled } from "@mui/material/styles"
import { FormattedMessage } from 'react-intl'

const StyledButton = styled(Button)(({ theme, color }) => ({
    minWidth: 0,
    margin: theme.spacing(0.5),
    // backgroundColor: color ? theme.palette[color].light : undefined
}));

const MuiButton = React.forwardRef((props, ref) => {

    const { text, variant, color, onClick, disabled, type, ...others } = props;
    const str = `general.${text.toLowerCase()}`;
    const renderIcon = (text) => {
        switch (text.toLowerCase()) {
            case 'create':
            case 'add':
                return <AddIcon />
            case 'modify':
            case 'update':
            case 'save':
                return <SaveIcon />
            case 'copy':
                return <ContentCopyIcon />
            case 'edit':
                return <EditIcon />
            case 'search':
                return <SearchIcon />
            case 'cancel':
            case 'download':
                return <FileDownloadIcon />
            case 'excel':
                return <FileDownloadIcon />
            default:
                return <DeleteIcon />;
        }
    }

    useImperativeHandle(ref, () => ({

    }));

    return (
        <StyledButton
            startIcon={renderIcon(text)}
            variant={variant ?? "contained"}
            color={color ?? "primary"}
            disabled={disabled}
            onClick={onClick}
            type={type}
            {...others}
        >
            <FormattedMessage id={str} />
        </StyledButton>
    )
})

export default MuiButton
