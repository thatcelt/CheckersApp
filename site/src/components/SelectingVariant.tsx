import { FC, memo } from 'react';

const SelectingVariant: FC<{ title: string, onSubmit: () => void }> = ({ title, onSubmit }) => {
    return (
        <>
        <div className="selecting-variant animated" onClick={onSubmit}>
            <div className="selecting-variant-content">
                {title}
            </div>
            <img src="../src/resources/assets/arrow.svg" alt="Arrow" />
        </div>
        </>
    )
};

export default memo(SelectingVariant);