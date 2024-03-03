const differenceInMinutes = (checkedTime: string) => {
    const now = new Date();
    const TimeCheck = new Date(checkedTime);
    const differenceInDays =
    (now.getTime() - TimeCheck.getTime()) / (1000 * 60)
    return differenceInDays
  };
  
  export default differenceInMinutes