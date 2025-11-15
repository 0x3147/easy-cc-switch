import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, TextField, InputAdornment, Paper } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import MarketplaceCard from '../global-mcp/components/marketplace-card'
import type { McpMarketplaceItem } from '@/shared/types/mcp'

// 模拟 MCP 市场数据
const MARKETPLACE_ITEMS: McpMarketplaceItem[] = [
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    author: 'ModelContext Protocol',
    description: '提供对本地文件系统的安全访问能力，支持文件读写、目录浏览等操作。',
    longDescription:
      'Filesystem MCP 是一个强大的文件系统接口，允许 AI 助手安全地访问和操作本地文件。支持读取、写入、创建、删除文件和目录，同时提供沙箱机制确保安全性。',
    tags: ['文件系统', '开发工具', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 2500,
    installs: 15000,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/directory']
    }
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    author: 'ModelContext Protocol',
    description: '集成 GitHub API，支持仓库管理、Issue 处理、PR 审查等功能。',
    tags: ['GitHub', '开发工具', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    npmPackage: '@modelcontextprotocol/server-github',
    stars: 1800,
    installs: 8500,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: '<your-github-token>'
      }
    }
  },
  {
    id: 'postgres',
    name: 'PostgreSQL MCP',
    author: 'ModelContext Protocol',
    description: '连接 PostgreSQL 数据库，支持查询、数据分析和数据库管理操作。',
    tags: ['数据库', 'PostgreSQL', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 1500,
    installs: 6200,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: {
        POSTGRES_CONNECTION_STRING: 'postgresql://localhost/mydb'
      }
    }
  },
  {
    id: 'slack',
    name: 'Slack MCP',
    author: 'ModelContext Protocol',
    description: '集成 Slack 工作空间，发送消息、管理频道、查看历史记录。',
    tags: ['Slack', '通信', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 1200,
    installs: 5400,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: {
        SLACK_BOT_TOKEN: '<your-slack-bot-token>',
        SLACK_TEAM_ID: '<your-team-id>'
      }
    }
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer MCP',
    author: 'ModelContext Protocol',
    description: '使用 Puppeteer 进行网页自动化操作，支持截图、表单填写、数据抓取。',
    tags: ['自动化', '浏览器', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 2100,
    installs: 9800,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer']
    }
  },
  {
    id: 'google-maps',
    name: 'Google Maps MCP',
    author: 'ModelContext Protocol',
    description: '集成 Google Maps API，提供地理编码、路线规划、地点搜索功能。',
    tags: ['地图', 'Google', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 980,
    installs: 4200,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-google-maps'],
      env: {
        GOOGLE_MAPS_API_KEY: '<your-api-key>'
      }
    }
  },
  {
    id: 'brave-search',
    name: 'Brave Search MCP',
    author: 'ModelContext Protocol',
    description: '使用 Brave Search API 进行网页搜索，获取实时信息。',
    tags: ['搜索', 'Brave', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 850,
    installs: 3600,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {
        BRAVE_API_KEY: '<your-brave-api-key>'
      }
    }
  },
  {
    id: 'memory',
    name: 'Memory MCP',
    author: 'ModelContext Protocol',
    description: '提供持久化记忆存储，让 AI 助手记住上下文和用户偏好。',
    tags: ['记忆', '存储', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 1650,
    installs: 7800,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory']
    }
  },
  {
    id: 'sqlite',
    name: 'SQLite MCP',
    author: 'ModelContext Protocol',
    description: '连接 SQLite 数据库，执行查询和数据管理操作。',
    tags: ['数据库', 'SQLite', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 1320,
    installs: 5900,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', '/path/to/database.db']
    }
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking MCP',
    author: 'ModelContext Protocol',
    description: '增强 AI 的推理能力，支持分步骤思考和复杂问题解决。',
    tags: ['推理', '思考', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    stars: 2800,
    installs: 12000,
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
    }
  },
  {
    id: 'google-drive',
    name: 'Google Drive MCP',
    author: 'ModelContext Protocol',
    description: '访问和管理 Google Drive 文件，支持文件上传、下载、共享等操作。',
    tags: ['云存储', 'Google', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-gdrive'],
      env: {
        GOOGLE_DRIVE_CREDENTIALS: '<your-credentials-json>'
      }
    }
  },
  {
    id: 'mysql',
    name: 'MySQL MCP',
    author: 'ModelContext Protocol',
    description: '连接 MySQL 数据库，执行 SQL 查询和数据库管理。',
    tags: ['数据库', 'MySQL', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-mysql'],
      env: {
        MYSQL_CONNECTION_STRING: 'mysql://user:password@localhost:3306/database'
      }
    }
  },
  {
    id: 'docker',
    name: 'Docker MCP',
    author: 'ModelContext Protocol',
    description: '管理 Docker 容器和镜像，支持容器启动、停止、日志查看等操作。',
    tags: ['Docker', '容器', '开发工具'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-docker']
    }
  },
  {
    id: 'git',
    name: 'Git MCP',
    author: 'ModelContext Protocol',
    description: '执行 Git 命令，查看仓库状态、提交历史、分支管理等。',
    tags: ['Git', '版本控制', '开发工具'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git']
    }
  },
  {
    id: 'aws',
    name: 'AWS MCP',
    author: 'ModelContext Protocol',
    description: '访问 AWS 服务，包括 S3、EC2、Lambda 等资源管理。',
    tags: ['AWS', '云服务', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-aws'],
      env: {
        AWS_ACCESS_KEY_ID: '<your-access-key>',
        AWS_SECRET_ACCESS_KEY: '<your-secret-key>',
        AWS_REGION: 'us-east-1'
      }
    }
  },
  {
    id: 'notion',
    name: 'Notion MCP',
    author: 'ModelContext Protocol',
    description: '访问和管理 Notion 页面和数据库，支持内容创建和编辑。',
    tags: ['Notion', '笔记', '知识管理'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-notion'],
      env: {
        NOTION_API_KEY: '<your-notion-integration-token>'
      }
    }
  },
  {
    id: 'jira',
    name: 'Jira MCP',
    author: 'ModelContext Protocol',
    description: '集成 Jira，管理任务、问题跟踪和项目管理。',
    tags: ['Jira', '项目管理', '官方'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-jira'],
      env: {
        JIRA_URL: 'https://your-domain.atlassian.net',
        JIRA_EMAIL: '<your-email>',
        JIRA_API_TOKEN: '<your-api-token>'
      }
    }
  },
  {
    id: 'mongodb',
    name: 'MongoDB MCP',
    author: 'ModelContext Protocol',
    description: '连接 MongoDB 数据库，执行查询和数据操作。',
    tags: ['数据库', 'MongoDB', 'NoSQL'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-mongodb'],
      env: {
        MONGODB_URI: 'mongodb://localhost:27017/mydb'
      }
    }
  },
  {
    id: 'redis',
    name: 'Redis MCP',
    author: 'ModelContext Protocol',
    description: '访问 Redis 缓存服务器，执行键值存储操作。',
    tags: ['数据库', 'Redis', '缓存'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-redis'],
      env: {
        REDIS_URL: 'redis://localhost:6379'
      }
    }
  },
  {
    id: 'gitlab',
    name: 'GitLab MCP',
    author: 'ModelContext Protocol',
    description: '集成 GitLab API，管理仓库、合并请求和 CI/CD 流水线。',
    tags: ['GitLab', '开发工具', 'CI/CD'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-gitlab'],
      env: {
        GITLAB_PERSONAL_ACCESS_TOKEN: '<your-gitlab-token>',
        GITLAB_URL: 'https://gitlab.com'
      }
    }
  },
  {
    id: 'discord',
    name: 'Discord MCP',
    author: 'ModelContext Protocol',
    description: '集成 Discord，发送消息、管理频道和服务器。',
    tags: ['Discord', '通信', '社区'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-discord'],
      env: {
        DISCORD_BOT_TOKEN: '<your-bot-token>'
      }
    }
  },
  {
    id: 'confluence',
    name: 'Confluence MCP',
    author: 'ModelContext Protocol',
    description: '访问 Confluence 知识库，创建和管理文档页面。',
    tags: ['Confluence', '文档', '知识管理'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-confluence'],
      env: {
        CONFLUENCE_URL: 'https://your-domain.atlassian.net',
        CONFLUENCE_EMAIL: '<your-email>',
        CONFLUENCE_API_TOKEN: '<your-api-token>'
      }
    }
  },
  {
    id: 'trello',
    name: 'Trello MCP',
    author: 'ModelContext Protocol',
    description: '管理 Trello 看板、列表和卡片，进行任务跟踪。',
    tags: ['Trello', '项目管理', '看板'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-trello'],
      env: {
        TRELLO_API_KEY: '<your-api-key>',
        TRELLO_TOKEN: '<your-token>'
      }
    }
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch MCP',
    author: 'ModelContext Protocol',
    description: '连接 Elasticsearch，执行搜索和数据分析操作。',
    tags: ['搜索', 'Elasticsearch', '数据分析'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-elasticsearch'],
      env: {
        ELASTICSEARCH_URL: 'http://localhost:9200'
      }
    }
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare MCP',
    author: 'ModelContext Protocol',
    description: '管理 Cloudflare 服务，包括 DNS、Workers 和缓存配置。',
    tags: ['Cloudflare', 'CDN', '云服务'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-cloudflare'],
      env: {
        CLOUDFLARE_API_TOKEN: '<your-api-token>',
        CLOUDFLARE_ACCOUNT_ID: '<your-account-id>'
      }
    }
  },
  {
    id: 'vercel',
    name: 'Vercel MCP',
    author: 'ModelContext Protocol',
    description: '管理 Vercel 部署，查看项目状态和环境变量。',
    tags: ['Vercel', '部署', '云服务'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-vercel'],
      env: {
        VERCEL_TOKEN: '<your-vercel-token>'
      }
    }
  },
  {
    id: 'linear',
    name: 'Linear MCP',
    author: 'ModelContext Protocol',
    description: '集成 Linear，管理任务、问题和项目进度。',
    tags: ['Linear', '项目管理', '任务'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-linear'],
      env: {
        LINEAR_API_KEY: '<your-api-key>'
      }
    }
  },
  {
    id: 'airtable',
    name: 'Airtable MCP',
    author: 'ModelContext Protocol',
    description: '访问 Airtable 数据库，管理表格和记录。',
    tags: ['Airtable', '数据库', '表格'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-airtable'],
      env: {
        AIRTABLE_API_KEY: '<your-api-key>',
        AIRTABLE_BASE_ID: '<your-base-id>'
      }
    }
  },
  {
    id: 'stripe',
    name: 'Stripe MCP',
    author: 'ModelContext Protocol',
    description: '集成 Stripe 支付，管理客户、订单和支付信息。',
    tags: ['支付', 'Stripe', '电商'],
    repository: 'https://github.com/modelcontextprotocol/servers',
    serverType: 'stdio',
    configTemplate: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-stripe'],
      env: {
        STRIPE_SECRET_KEY: '<your-secret-key>'
      }
    }
  }
]

const McpMarketplacePage = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤 MCP 项目
  const filteredItems = MARKETPLACE_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleInstall = async (item: McpMarketplaceItem) => {
    console.log('Installing MCP:', item)
    // TODO: 实现安装逻辑 - 打开添加 MCP 对话框并预填充配置
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 页面标题 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {t('mcpMarketplace.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('mcpMarketplace.description')}
        </Typography>
      </Box>

      {/* 搜索框 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('mcpMarketplace.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FontAwesomeIcon icon={faSearch} style={{ color: '#999' }} />
              </InputAdornment>
            )
          }}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>

      {/* MCP 卡片网格布局 */}
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
        {filteredItems.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 2
            }}
          >
            {filteredItems.map((item) => (
              <MarketplaceCard key={item.id} item={item} onInstall={handleInstall} />
            ))}
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {t('mcpMarketplace.noResults')}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  )
}

export default McpMarketplacePage
