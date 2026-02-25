import axios from 'axios'

async function checkIP() {
  try {
    // Check what our public IP is
    const response = await axios.get('https://api.ipify.org?format=json')
    console.log('Our public IP (via ipify):', response.data.ip)
    
    // Check via another service
    const response2 = await axios.get('https://ifconfig.me/ip')
    console.log('Our public IP (via ifconfig.me):', response2.data.trim())
    
  } catch (error) {
    console.error('Failed to get IP:', error.message)
  }
}

checkIP()