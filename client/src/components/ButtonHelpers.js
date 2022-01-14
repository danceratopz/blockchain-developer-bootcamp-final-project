import { colors } from '../theme';
import { Spinner } from 'react-bootstrap';
import { StyledTxn } from './StyledAddress';
import { ConnectBtn, StyledItem } from './StyledHelpers';
import { FaCopy } from 'react-icons/fa';


const SkinnySpinner = () => {
    return (
        <Spinner animation="border" size="sm" style={{ color: colors.green, marginTop: '2px', marginBottom: '3px' }}
        />
    );
}

export const CopyButton = ({ textToCopy }) => {
    return (
        <ConnectBtn
            style={{ border: "0px", width: "20px" }}
            onClick={() => { navigator.clipboard.writeText(textToCopy) }}>
            <FaCopy size="15" color={colors.blue} />
        </ConnectBtn>
    );
}

export const DisabledButton = ({ text }) => {
    return (<StyledItem>
        <ConnectBtn
            style={{ width: "150px", border: "1px solid white" }}
            disabled="1">
            {text}
        </ConnectBtn>
    </StyledItem>
    );
}

export const PendingButton = () => {
    return (
        <StyledItem>
            <ConnectBtn
                style={{ width: "150px" }}
                disabled="1">
                <SkinnySpinner />
            </ConnectBtn>
        </StyledItem>
    );
}

export const SuccessButton = ({ txnHash }) => {
    return (
        <StyledItem>
            <ConnectBtn
                style={{ width: "150px", border: "1px solid " + colors.green }}
                disabled="1"
                type="submit">
                <StyledTxn hash={txnHash} />
            </ConnectBtn>
        </StyledItem>
    );
}