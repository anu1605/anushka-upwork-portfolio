import { useFlash } from '../context/FlashContext.jsx';
import Icon from './Icon.jsx';

export default function Flash() {
    const { flash, clear } = useFlash();

    if (!flash) {
        return null;
    }

    return (
        <div className="flash-wrap">
            <div
                className={`flash flash-${flash.type}`}
                role={flash.type === 'error' ? 'alert' : 'status'}
                onClick={clear}
            >
                <Icon name={flash.type === 'error' ? 'alert' : 'check'} />
                <span>{flash.message}</span>
            </div>
        </div>
    );
}
