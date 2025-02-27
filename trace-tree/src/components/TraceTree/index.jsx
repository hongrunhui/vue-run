import { createSignal } from 'solid-js';

const TraceTree = (props) => {
    const { nodes } = props;
    const [isOpen, setIsOpen] = createSignal(true); // 控制折叠状态
    console.log('nodes', nodes);
    if (!nodes || !nodes.length) return (
        <div>
            组件树
        </div>
    );

    return (
        <div className="trace-tree">
            组件树
            {nodes.map(node => (
                <div className="tree-node" key={node.location}>
                    <div className="node-content" onClick={() => setIsOpen(!isOpen())}>
                        {node.name}
                        <span className="time">({node.endTime - node.startTime}ms)</span>
                        {node.children.length > 0 && (
                            <span className="toggle-icon">{isOpen() ? '▼' : '►'}</span> // 切换图标
                        )}
                    </div>
                    {isOpen() && node.children.length ? ( // 根据折叠状态渲染子节点
                        <div className="children">
                            <TraceTree nodes={node.children} /> {/* 递归调用 */}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
};

export default TraceTree; 