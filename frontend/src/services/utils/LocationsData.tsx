import domainApi from "../config/domainApi";
const token = localStorage.getItem('token');

interface LocationData {
  location_name: string;
  id: string;
}

interface LocationsData {
    readonly value: string;
    readonly label: string;
  }

export const fetchLocationData = async (): Promise<readonly LocationsData[]> => {
  try {
    const response = await fetch(`${domainApi}/api/v1/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const locationOptions: readonly LocationsData[] = data.data.map((location: LocationData) => ({
        value: location.id,
        label: location.location_name,
      }));

      return locationOptions;
    } else {
      console.error('Error fetching location data:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error during fetch:', error);
    return [];
  }
};
