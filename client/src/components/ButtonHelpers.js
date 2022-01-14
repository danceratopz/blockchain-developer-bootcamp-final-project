import { colors } from '../theme';
import { Spinner } from 'react-bootstrap';
import { StyledTxn } from './StyledAddress';
import { FractButton, StyledItem } from './StyledHelpers';
import { FaCopy } from 'react-icons/fa';


const SkinnySpinner = () => {
    return (
        <Spinner animation="border" size="sm" style={{ color: colors.green, marginTop: '2px', marginBottom: '3px' }}
        />
    );
}

export const CopyButton = ({ textToCopy }) => {
    return (
        <FractButton
            style={{ border: "0px", width: "20px" }}
            onClick={() => { navigator.clipboard.writeText(textToCopy) }}>
            <FaCopy size="15" color={colors.blue} />
        </FractButton>
    );
}

export const DisabledButton = ({ text }) => {
    return (<StyledItem>
        <FractButton
            style={{ width: "150px", border: "1px solid white" }}
            disabled="1">
            {text}
        </FractButton>
    </StyledItem>
    );
}

export const PendingButton = () => {
    return (
        <StyledItem>
            <FractButton
                style={{ width: "150px" }}
                disabled="1">
                <SkinnySpinner />
            </FractButton>
        </StyledItem>
    );
}

export const SuccessButton = ({ txnHash }) => {
    return (
        <StyledItem>
            <FractButton
                style={{ width: "150px", border: "1px solid " + colors.green }}
                disabled="1"
                type="submit">
                <StyledTxn hash={txnHash} />
            </FractButton>
        </StyledItem>
    );
}