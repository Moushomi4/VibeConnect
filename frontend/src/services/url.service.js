import axios from 'axios'
const appUrl=`${import.meta.env.VITE_API_URL}/api`
const axiosInstance=axios.create({
    baseURL:appUrl,
    withCredentials:true

})
export default axiosInstance;