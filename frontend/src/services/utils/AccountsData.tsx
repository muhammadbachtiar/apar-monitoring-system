import domainApi from "../config/domainApi";
const token = localStorage.getItem('token');

interface AccountData {
  name: string;
  id: string;
}

interface AccountsData {
    readonly value: string;
    readonly label: string;
  }

export const fetchAccountsData = async (): Promise<readonly AccountsData[]> => {
  try {
    const response = await fetch(`${domainApi}/api/v1/users?role=checker`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const accountOptions: readonly AccountsData[] = data.data.map((location: AccountData) => ({
        value: location.id,
        label: location.name,
      }));

      return accountOptions;
    } else {
      console.error('Error fetching location data:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error during fetch:', error);
    return [];
  }
};
