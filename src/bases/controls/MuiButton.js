import React, { useImperativeHandle } from 'react'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { styled } from "@mui/material/styles"
import { FormattedMessage } from 'react-intl'

const StyledButton = styled(Button)(({ theme, color }) => ({
    minWidth: 0,
    margin: theme.spacing(0.5),
    // backgroundColor: color ? theme.palette[color].light : undefined
}));

const MuiButton = React.forwardRef((props, ref) => {

    const { text, variant, color, onClick, ...others } = props;
    const str = `general.${text.toLowerCase()}`;
    const renderIcon = (text) => {
        switch (text.toLowerCase()) {
            case 'create':
            case 'add':
                return <AddIcon />
            case 'modify':
            case 'update':
            case 'edit':
                return <EditIcon />
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
            onClick={onClick}
            {...others}
        >
            <FormattedMessage id={str} />
        </StyledButton>
    )
})

export default MuiButton
