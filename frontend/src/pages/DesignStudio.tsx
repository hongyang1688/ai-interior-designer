import React, { useState, useEffect, useRef } from 'react'
import { Graph } from '@antv/x6'
import '@antv/x6-react-shape'
import {
  Card,
  Button,
  Row,
  Col,
  Select,
  Slider,
  Tabs,
  List,
  Tag,
  Progress,
  message,
  Drawer,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  NodeIndexOutlined,
  ApiOutlined,
  PictureOutlined,
  BoxPlotOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import './DesignStudio.css'

const { Option } = Select
const { TabPane } = Tabs

// Custom node component
const NodeComponent = ({ node }: { node: any }) => {
  const data = node.getData()
  const status = data?.status || 'pending'
  
  const statusColors = {
    pending: '#d9d9d9',
    processing: '#1890ff',
    completed: '#52c41a',
    failed: '#ff4d4f',
  }

  return (
    <div
      style={{
        width: 180,
        padding: 12,
        background: '#fff',
        border: `2px solid ${statusColors[status as keyof typeof statusColors]}`,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 20, marginRight: 8 }}>{data?.icon}</span>
        <span style={{ fontWeight: 'bold' }}>{data?.label}</span>
      </div>
      
      {data?.description && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          {data.description}
        </div>
      )}
      
      {status === 'processing' && (
        <Progress percent={data.progress || 0} size="small" />
      )}
      
      {status === 'completed' && (
        <Tag color="success" size="small">已完成</Tag>
      )}
      
      {status === 'failed' && (
        <Tag color="error" size="small">失败</Tag>
      )}
    </div>
  )
}

const DesignStudio: React.FC = () => {
  const graphRef = useRef<HTMLDivElement>(null)
  const [graph, setGraph] = useState<Graph | null>(null)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  // Define DAG nodes
  const nodes = [
    {
      id: 'input',
      label: '户型图输入',
      icon: '📁',
      description: '从S3读取500张图片',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'analysis',
      label: '户型解析',
      icon: '🔍',
      description: 'AI识别房间结构',
      status: 'completed',
      progress: 100,
    },
    {
      id: 'style-transfer',
      label: '风格渲染',
      icon: '🎨',
      description: '现代简约+北欧风',
      status: 'processing',
      progress: 65,
    },
    {
      id: '3d-generation',
      label: '3D场景生成',
      icon: '🎬',
      description: '生成可交互3D模型',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'cad-generation',
      label: 'CAD图纸生成',
      icon: '📐',
      description: '平面图/立面图/水电图',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'material-matching',
      label: '材料匹配',
      icon: '🛒',
      description: '匹配建材和报价',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'render-views',
      label: '多视角渲染',
      icon: '📸',
      description: '生成8个空间视角',
      status: 'pending',
      progress: 0,
    },
    {
      id: 'output',
      label: '输出交付',
      icon: '📦',
      description: '打包所有成果',
      status: 'pending',
      progress: 0,
    },
  ]

  // Define edges
  const edges = [
    { source: 'input', target: 'analysis' },
    { source: 'analysis', target: 'style-transfer' },
    { source: 'style-transfer', target: '3d-generation' },
    { source: 'style-transfer', target: 'cad-generation' },
    { source: 'style-transfer', target: 'material-matching' },
    { source: 'style-transfer', target: 'render-views' },
    { source: '3d-generation', target: 'output' },
    { source: 'cad-generation', target: 'output' },
    { source: 'material-matching', target: 'output' },
    { source: 'render-views', target: 'output' },
  ]

  useEffect(() => {
    if (!graphRef.current) return

    // Initialize X6 graph
    const g = new Graph({
      container: graphRef.current,
      width: graphRef.current.clientWidth,
      height: 600,
      grid: true,
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
      },
    })

    // Register custom node
    g.registerNode(
      'custom-node',
      {
        inherit: 'react-shape',
        component: NodeComponent,
      },
      true
    )

    // Add nodes
    const nodePositions: Record<string, { x: number; y: number }> = {
      input: { x: 100, y: 300 },
      analysis: { x: 350, y: 300 },
      'style-transfer': { x: 600, y: 300 },
      '3d-generation': { x: 850, y: 150 },
      'cad-generation': { x: 850, y: 250 },
      'material-matching': { x: 850, y: 350 },
      'render-views': { x: 850, y: 450 },
      output: { x: 1100, y: 300 },
    }

    nodes.forEach((node) => {
      g.addNode({
        id: node.id,
        shape: 'custom-node',
        x: nodePositions[node.id].x,
        y: nodePositions[node.id].y,
        data: node,
      })
    })

    // Add edges
    edges.forEach((edge, index) => {
      g.addEdge({
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      })
    })

    // Handle node click
    g.on('node:click', ({ node }) => {
      setSelectedNode(node)
      setDrawerVisible(true)
    })

    setGraph(g)

    return () => {
      g.dispose()
    }
  }, [])

  const handleRun = () => {
    setIsRunning(true)
    message.success('开始执行设计流程')
  }

  const handlePause = () => {
    setIsRunning(false)
    message.info('已暂停')
  }

  const handleReset = () => {
    setIsRunning(false)
    message.info('已重置')
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2>设计工作室</h2>
        </Col>
        <Col>
          <Button.Group>
            {!isRunning ? (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleRun}
              >
                执行
              </Button>
            ) : (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={handlePause}
              >
                暂停
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button icon={<SettingOutlined />}>
              配置
            </Button>
          </Button.Group>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* DAG Canvas */}
        <Col span={18}>
          <Card
            title="设计流程图"
            extra={<NodeIndexOutlined />}
            bodyStyle={{ padding: 0 }}
          >
            <div ref={graphRef} style={{ width: '100%', height: 600 }} />
          </Card>
        </Col>

        {/* Side Panel */}
        <Col span={6}>
          <Card title="节点列表" style={{ marginBottom: 24 }}>
            <List
              dataSource={nodes}
              renderItem={(node) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedNode(node)
                    setDrawerVisible(true)
                  }}
                >
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: 20 }}>{node.icon}</span>}
                    title={node.label}
                    description={
                      <div>
                        {node.status === 'completed' && (
                          <Tag color="success" size="small">已完成</Tag>
                        )}
                        {node.status === 'processing' && (
                          <Progress percent={node.progress} size="small" />
                        )}
                        {node.status === 'pending' && (
                          <Tag size="small">等待中</Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="全局配置">
            <div style={{ marginBottom: 16 }}>
              <label>渲染质量</label>
              <Select defaultValue="high" style={{ width: '100%', marginTop: 8 }}>
                <Option value="low">快速 (预览)</Option>
                <Option value="medium">标准</Option>
                <Option value="high">高质量 (4K)</Option>
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>并发任务数</label>
              <Slider min={1} max={8} defaultValue={4} />
            </div>

            <div>
              <label>AI模型</label>
              <Select defaultValue="kimi" style={{ width: '100%', marginTop: 8 }}>
                <Option value="kimi">Kimi K2.5</Option>
                <Option value="gpt4">GPT-4</Option>
                <Option value="claude">Claude 3</Option>
              </Select>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Node Detail Drawer */}
      <Drawer
        title={selectedNode?.label || selectedNode?.data?.label}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={400}
      >
        {selectedNode && (
          <Tabs defaultActiveKey="config">
            <TabPane tab="配置" key="config">
              <div style={{ marginBottom: 16 }}>
                <label>节点状态</label>
                <div style={{ marginTop: 8 }}>
                  {selectedNode.status === 'completed' || selectedNode.data?.status === 'completed' ? (
                    <Tag color="success">已完成</Tag>
                  ) : selectedNode.status === 'processing' || selectedNode.data?.status === 'processing' ? (
                    <Tag color="processing">处理中</Tag>
                  ) : (
                    <Tag>等待中</Tag>
                  )}
                </div>
              </div>

              {selectedNode.data?.status === 'processing' && (
                <div style={{ marginBottom: 16 }}>
                  <label>进度</label>
                  <Progress percent={selectedNode.data?.progress || 0} />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label>描述</label>
                <p style={{ color: '#666', marginTop: 8 }}>
                  {selectedNode.description || selectedNode.data?.description}
                </p>
              </div>

              <Button type="primary" block icon={<PlayCircleOutlined />}>
                重新执行
              </Button>
            </TabPane>

            <TabPane tab="日志" key="logs">
              <div
                style={{
                  background: '#1a1a2e',
                  color: '#fff',
                  padding: 16,
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  height: 400,
                  overflow: 'auto',
                }}
              >
                <div>[2026-02-25 12:00:00] 开始执行...</div>
                <div>[2026-02-25 12:00:01] 加载配置</div>
                <div>[2026-02-25 12:00:02] 初始化模型</div>
                <div style={{ color: '#52c41a' }}>[2026-02-25 12:00:03] ✓ 准备就绪</div>
              </div>
            </TabPane>

            <TabPane tab="输出" key="output">
              {selectedNode.id === 'style-transfer' || selectedNode.data?.id === 'style-transfer' ? (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <PictureOutlined /> 渲染图 x 500
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 100,
                          height: 75,
                          background: '#f0f0f0',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PictureOutlined />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty description="暂无输出" />
              )}
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  )
}

export default DesignStudio