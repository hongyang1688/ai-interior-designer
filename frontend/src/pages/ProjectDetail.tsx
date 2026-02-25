import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Steps,
  Button,
  Tabs,
  List,
  Tag,
  Progress,
  Timeline,
  Descriptions,
  Image,
  Empty,
  Statistic,
  Badge,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  DownloadOutlined,
  PictureOutlined,
  HomeOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  BoxPlotOutlined,
} from '@ant-design/icons'
import ChatAssistant from '../components/ChatAssistant'

const { Step } = Steps
const { TabPane } = Tabs

interface DesignResult {
  id: string
  roomType: string
  style: string
  thumbnail: string
  status: 'pending' | 'processing' | 'completed'
  progress: number
}

const mockResults: DesignResult[] = [
  {
    id: '1',
    roomType: '客厅',
    style: '现代简约',
    thumbnail: '',
    status: 'completed',
    progress: 100,
  },
  {
    id: '2',
    roomType: '主卧',
    style: '北欧风',
    thumbnail: '',
    status: 'completed',
    progress: 100,
  },
  {
    id: '3',
    roomType: '厨房',
    style: '现代简约',
    thumbnail: '',
    status: 'processing',
    progress: 65,
  },
]

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock project data
  const project = {
    id: Number(id),
    name: '阳光花园 3号楼 801',
    description: '89㎡ 三室两厅，现代简约+北欧混搭风格',
    status: 'processing',
    imageCount: 500,
    progress: 75,
    style: ['现代简约', '北欧风'],
    budget: '30-50万',
    budgetMin: 30,
    budgetMax: 50,
    s3Source: 's3://real-estate/floorplans/',
    familyInfo: {
      members: 3,
      children: 1,
      pets: 'cat',
    },
    preferences: {
      likes: ['明亮', '木质', '简约'],
      dislikes: ['昏暗', '花哨'],
    },
    createdAt: '2026-02-20',
    updatedAt: '2026-02-25',
  }

  const processingSteps = [
    { title: '户型解析', status: 'finish', description: '已完成 500张图片' },
    { title: '风格渲染', status: 'finish', description: '已完成' },
    { title: '3D场景生成', status: 'process', description: '处理中 65%' },
    { title: 'CAD图纸', status: 'wait', description: '等待中' },
    { title: '材料匹配', status: 'wait', description: '等待中' },
  ]

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/projects')}
            style={{ marginRight: 16 }}
          >
            返回列表
          </Button>
          <span style={{ fontSize: 20, fontWeight: 'bold' }}>{project.name}</span>
        </Col>
        <Col>
          {project.status === 'pending' && (
            <Button type="primary" icon={<PlayCircleOutlined />}>
              开始处理
            </Button>
          )}
          {project.status === 'completed' && (
            <Button icon={<DownloadOutlined />}>
              下载全部
            </Button>
          )}
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Column */}
        <Col span={16}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            {/* Overview Tab */}
            <TabPane tab="概览" key="overview">
              <Card title="处理进度" style={{ marginBottom: 24 }}>
                <Steps direction="vertical" current={2}>
                  {processingSteps.map((step, index) => (
                    <Step
                      key={index}
                      title={step.title}
                      description={step.description}
                      status={step.status as any}
                    />
                  ))}
                </Steps>

                <div style={{ marginTop: 24 }}>
                  <Progress percent={project.progress} status="active" />
                  <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
                    总体进度 {project.progress}%
                  </div>
                </div>
              </Card>

              <Card title="生成结果" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  {mockResults.map((result) => (
                    <Col span={8} key={result.id}>
                      <Card
                        hoverable
                        cover={
                          <div
                            style={{
                              height: 160,
                              background: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {result.status === 'completed' ? (
                              <PictureOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                            ) : (
                              <Progress
                                type="circle"
                                percent={result.progress}
                                width={80}
                              />
                            )}
                          </div>
                        }
                      >
                        <Card.Meta
                          title={result.roomType}
                          description={
                            <div>
                              <Tag>{result.style}</Tag>
                              {result.status === 'processing' && (
                                <Badge status="processing" text="生成中" />
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>

            {/* Designs Tab */}
            <TabPane tab="效果图" key="designs">
              <Row gutter={[16, 16]}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <Col span={8} key={index}>
                    <Image
                      src={`https://via.placeholder.com/400x300?text=Design+${index + 1}`}
                      alt={`Design ${index + 1}`}
                      style={{ borderRadius: 8 }}
                    />
                  </Col>
                ))}
              </Row>
            </TabPane>

            {/* 3D Tour Tab */}
            <TabPane tab="3D漫游" key="3d-tour">
              <Card>
                <div
                  style={{
                    height: 500,
                    background: '#1a1a2e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <VideoCameraOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                    <p>3D漫游场景加载中...</p>
                    <Button type="primary" size="large">
                      进入3D漫游
                    </Button>
                  </div>
                </div>
              </Card>
            </TabPane>

            {/* CAD Tab */}
            <TabPane tab="CAD图纸" key="cad">
              <List
                dataSource={[
                  { name: '平面图', type: 'floor_plan', status: 'completed' },
                  { name: '立面图', type: 'elevation', status: 'completed' },
                  { name: '水电图', type: 'electrical', status: 'processing' },
                  { name: '材料清单', type: 'materials', status: 'pending' },
                ]}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        disabled={item.status !== 'completed'}
                      >
                        下载
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FileTextOutlined style={{ fontSize: 24 }} />}
                      title={item.name}
                      description={
                        item.status === 'completed' ? (
                          <Tag color="success">已完成</Tag>
                        ) : item.status === 'processing' ? (
                          <Tag color="processing">生成中</Tag>
                        ) : (
                          <Tag>等待中</Tag>
                        )
                      }
                    />
                  </List.Item>
                )}
              />
            </TabPane>

            {/* Materials Tab */}
            <TabPane tab="材料清单" key="materials">
              <Card title="预算概览">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="总预算"
                      value={`${project.budgetMin}-${project.budgetMax}`}
                      suffix="万"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="预估总价"
                      value={42}
                      suffix="万"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="材料项"
                      value={156}
                      suffix="项"
                    />
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Col>

        {/* Right Column */}
        <Col span={8}>
          <Card title="项目信息" style={{ marginBottom: 24 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="数据来源">{project.s3Source}</Descriptions.Item>
              <Descriptions.Item label="图片数量">{project.imageCount} 张</Descriptions.Item>
              <Descriptions.Item label="装修风格">
                {project.style.map((s) => <Tag key={s}>{s}</Tag>)}
              </Descriptions.Item>
              <Descriptions.Item label="预算范围">{project.budget}</Descriptions.Item>
              <Descriptions.Item label="家庭成员">
                {project.familyInfo.members}人
                {project.familyInfo.children > 0 && ` (${project.familyInfo.children}儿童)`}
                {project.familyInfo.pets && ` + 🐈`}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{project.createdAt}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="AI设计助手" style={{ height: 600 }}>
            <div style={{ height: '100%' }}>
              <ChatAssistant projectId={project.id} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProjectDetail