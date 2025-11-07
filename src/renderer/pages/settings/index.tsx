import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Divider,
  Stack
} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette, faLanguage } from '@fortawesome/free-solid-svg-icons'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const SettingsPage = () => {
  const { mode, setThemeMode } = useTheme()
  const { t, i18n } = useTranslation()

  const handleThemeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as 'light' | 'dark' | 'system'
    setThemeMode(newMode)
  }

  const handleLanguageChange = async (event: any) => {
    const newLang = event.target.value
    i18n.changeLanguage(newLang)
    try {
      await window.api.setLanguage(newLang)
    } catch (error) {
      console.error('Failed to save language:', error)
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
          {t('settings.title')}
        </Typography>
      </Box>

      {/* 主题设置 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FontAwesomeIcon icon={faPalette} />
            {t('settings.theme.title')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t('settings.theme.description')}
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup value={mode} onChange={handleThemeChange}>
                <FormControlLabel
                  value="light"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t('settings.theme.light')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t('settings.theme.dark')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="system"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {t('settings.theme.system')}
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* 语言设置 */}
      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FontAwesomeIcon icon={faLanguage} />
            {t('settings.language.title')}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t('settings.language.description')}
            </Typography>
            <FormControl fullWidth>
              <Select value={i18n.language} onChange={handleLanguageChange}>
                <MenuItem value="zh">{t('settings.language.zh')}</MenuItem>
                <MenuItem value="en">{t('settings.language.en')}</MenuItem>
                <MenuItem value="de">{t('settings.language.de')}</MenuItem>
                <MenuItem value="fr">{t('settings.language.fr')}</MenuItem>
                <MenuItem value="it">{t('settings.language.it')}</MenuItem>
                <MenuItem value="th">{t('settings.language.th')}</MenuItem>
                <MenuItem value="vi">{t('settings.language.vi')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SettingsPage
