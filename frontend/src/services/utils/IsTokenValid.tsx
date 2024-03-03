import domainApi from '../config/domainApi';


const isTokenValid = async (token :string) => {
  
    try {
      const response = await fetch(`${domainApi}/api/v1/auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        return { status: true, name: data.name, role: data.role };
      } else {
        return {  status: false, name: '', role: ''  };
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      return false;
    }
  };
  
  export default isTokenValid;