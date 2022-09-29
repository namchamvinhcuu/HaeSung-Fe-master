import React from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import { styled } from "@mui/material/styles"
import { FormattedMessage } from 'react-intl'

const StyledButton = styled(LoadingButton)(({ theme, color }) => ({
    minWidth: 0,
    margin: theme.spacing(0.5),
    backgroundColor: color ? theme.palette[color].light : undefined
}));

const MuiSubmitButton = (props) => {

    const { loading, variant, text, fullWidth } = props;

    const str = `general.${text}`;

    const renderIcon = (text) => {
        switch (text) {
            case 'save':
                return <SaveIcon />;
            case 'create':
                return <AddIcon />
            default:
                return <LoginIcon />;
        }
    }

    const renderColor = (text) => {
        switch (text) {
            case 'save':
                return 'primary';
            case 'create':
                return 'success';
            default:
                return 'primary';
        }
    }

    return (
        <StyledButton
            loading={loading ?? false}
            loadingPosition="start"
            startIcon={renderIcon(text)}
            variant={variant ?? "contained"}
            type='submit'
            color={renderColor(text)}
            fullWidth={fullWidth ? true : false}
        >
            <FormattedMessage id={str} />
        </StyledButton>
    )
}

export default MuiSubmitButton
