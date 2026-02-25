import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  List,
  Button,
  Tag,
  Progress,
  Empty,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Tooltip,
  Dropdown,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  FolderOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  PictureOutlined,
  HomeOutlined,
  WalletOutlined,
} from '@ant-design/icons'

const { Option } = Select

interface Project {
  id: number
  name: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  imageCount: number
  progress: number
  style: string[]
  budget: string
  createdAt: string
  thumbnail?: string
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: '阳光花园 3号楼 801',
    description: '89㎡ 三室两厅，现代简约风格',
    status: 'completed',
    imageCount: 500,
    progress: 100,
    style: ['现代简约', '北欧风'],
    budget: '30-50万',
    createdAt: '2026-02-20',
  },
  {
    id: 2,
    name: '万科城 5期 1202',
    description: '126㎡ 四室两厅，轻奢风格',
    status: 'processing',
    imageCount: 320,
    progress: 65,
    style: ['轻奢'],
    budget: '50-80万',
    createdAt: '2026-02-22',
  },
  {
    id: 3,
    name: '保利花园 8栋 303',
    description: '78㎡ 两室一厅，日式风格',
    status: 'pending',
    imageCount: 150,
    progress: 0,
    style: ['日式'],
    budget: '20-30万',
    createdAt: '2026-02-24',
  },
]

const ProjectList: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter ? project.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color="success" icon={<CheckCircleOutlined />}>已完成</Tag>
      case 'processing':
        return <Tag color="processing" icon={<SyncOutlined spin />}>处理中</Tag>
      case 'pending':
        return <Tag icon={<ClockCircleOutlined />}>待处理</Tag>
      case 'failed':
        return <Tag color="error" icon={<ExclamationCircleOutlined />}>失败</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#52c41a'
      case 'processing':
        return '#1890ff'
      case 'pending':
        return '#d9d9d9'
      case 'failed':
        return '#ff4d4f'
      default:
        return '#d9d9d9'
    }
  }

  const handleMenuClick = (projectId: number, key: string) => {
    if (key === 'delete') {
      setProjects(projects.filter((p) => p.id !== projectId))
    } else if (key === 'edit') {
      navigate(`/projects/${projectId}`)
    }
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h2>项目管理</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/projects/create')}
          >
            新建项目
          </Button>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={projects.length}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="处理中"
              value={projects.filter((p) => p.status === 'processing').length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={projects.filter((p) => p.status === 'completed').length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总图片数"
              value={projects.reduce((sum, p) => sum + p.imageCount, 0)}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Input
            placeholder="搜索项目名称..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="筛选状态"
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => setStatusFilter(value)}
          >
            <Option value="pending">待处理</Option>
            <Option value="processing">处理中</Option>
            <Option value="completed">已完成</Option>
            <Option value="failed">失败</Option>
          </Select>
        </Col>
      </Row>

      {/* Project List */}
      {filteredProjects.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={filteredProjects}
          renderItem={(project) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ cursor: 'pointer' }}
                actions={[
                  <Dropdown
                    key="more"
                    menu={{
                      items: [
                        { key: 'edit', label: '查看详情' },
                        { key: 'copy', label: '复制项目' },
                        { key: 'delete', label: '删除', danger: true },
                      ],
                      onClick: ({ key }) => handleMenuClick(project.id, key),
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <div>
                  {/* Thumbnail Placeholder */}
                  <div
                    style={{
                      height: 160,
                      background: `linear-gradient(135deg, ${getStatusColor(project.status)}20, ${getStatusColor(project.status)}40)`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <HomeOutlined style={{ fontSize: 48, color: getStatusColor(project.status) }} />
                  </div>

                  {/* Status */}
                  <div style={{ marginBottom: 12 }}>{getStatusTag(project.status)}</div>

                  {/* Title */}
                  <h3 style={{ marginBottom: 8 }}>{project.name}</h3>
                  <p style={{ color: '#666', marginBottom: 12 }}>{project.description}</p>

                  {/* Progress */}
                  {project.status === 'processing' && (
                    <div style={{ marginBottom: 12 }}>
                      <Progress percent={project.progress} size="small" />
                    </div>
                  )}

                  {/* Info */}
                  <Row gutter={8} style={{ fontSize: 12, color: '#666' }}>
                    <Col span={12}>
                      <PictureOutlined /> {project.imageCount} 张图片
                    </Col>
                    <Col span={12}>
                      <WalletOutlined /> {project.budget}
                    </Col>
                  </Row>

                  {/* Styles */}
                  <div style={{ marginTop: 12 }}>
                    {project.style.map((s) => (
                      <Tag key={s} size="small" style={{ marginRight: 4, marginBottom: 4 }}>
                        {s}
                      </Tag>
                    ))}
                  </div>

                  {/* Date */}
                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                    创建时间: {project.createdAt}
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="暂无项目"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/projects/create')}
          >
            创建第一个项目
          </Button>
        </Empty>
      )}
    </div>
  )
}

export default ProjectList