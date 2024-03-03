import React from 'react';
import { useEffect, useState } from 'react';
import { Row, Spinner, Card } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import DataTable, { TableColumn } from 'react-data-table-component';
import domainApi from '../../services/config/domainApi';
import differenceInDays from '../../services/utils/diffrentDayTime';
import ExportToExcelButton from '../../services/utils/ExportToExel';

type DataRowLocation = {
  location_name: string;
  total: number,
  already_check6Monthly: number,
  need_check6Monthly: number,
  already_check1Monthly: number,
  need_check1Monthly: number,
  working_apar: number,
  fix_apar: number
};

type AparData = {
  id: string
  apar_number: string
  id_location: string
  apar_type: string
  condition: boolean
  last_6montly_check_time: string;
  last_1montly_check_time: string;
  last_filing_time: string;
  registered_time: Date
  location: {location_name: string, id:string}
};

ChartJS.register(ArcElement, Tooltip, Legend);


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,

    },
  },
};

const locationStatistic: TableColumn<DataRowLocation>[] = [
  {
    name: 'Lokasi',
    selector: (row) => row.location_name,
    sortable: true,
  },
  {
    name: 'Jumlah',
    selector: (row) => row.total,
    sortable: true,
  },
  {
    name: 'Layak Operasi',
    selector: (row) => row.working_apar,
    sortable: true,
  },
  {
    name: 'Perbaikan',
    selector: (row) => row.fix_apar,
    sortable: true,
  },
  {
    name: 'Diperkisa (S)',
    selector: (row) => row.already_check6Monthly,
    sortable: true,
  },
  {
    name: 'Butuh Periksa (S)',
    selector: (row) => row.need_check6Monthly,
    sortable: true,
  },
  {
    name: 'Diperkisa (B)',
    selector: (row) => row.already_check1Monthly,
    sortable: true,
  },
  {
    name: 'Butuh Periksa (B)',
    selector: (row) => row.need_check1Monthly,
    sortable: true,
  },
];

const DashboardContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [aparsData, setAparsData] = useState([]);
  const [recordCheck, setRecordCheck] = useState<DataRowLocation[]>([]);
  const token = localStorage.getItem('token');
  const [aparTrue, setAparTrue] = useState(0);
  const [aparFalse, setAparFalse] = useState(0);
  const [aparType, setAparType] = useState<Record<string, { trueCount: number; falseCount: number; amount: number }>>({});
  const dataDognhnoutChart = {
    labels: ['Layak Operasi', 'Perbaikan'],
    datasets: [
      {
        label: 'Jumlah APAR',
        data: [aparTrue, aparFalse],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const labels = Object.keys(aparType);

  const data = {
    labels,
    datasets: [
      {
        label: 'Jumlah',
        data: labels.map((label) => aparType[label].amount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Layak Operasi',
        data: labels.map((label) => aparType[label].trueCount),
        backgroundColor: 'rgba(46, 204, 113, 0.5)',
      },
      {
        label: 'Perbaikan',
        data: labels.map((label) => aparType[label].falseCount),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  function formatObject(item: AparData) {
    const formattedItem = {
      Nomor_APAR: item.apar_number,
      Tipe_APAR: item.apar_type,
      Kondisi: item.condition ? 'Layak Operasi' : 'Perbaikan',
      Pemeriksaan_Semesteran_Terakhir: new Date(item.last_6montly_check_time).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }),
      Pemeriksaan_Bulanan_Terakhir: new Date(item.last_1montly_check_time).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }),
      Pengisian_Terakhir: new Date(item.last_filing_time).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }),
      Lokasi: item.location.location_name,
    };
  
    return formattedItem;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${domainApi}/api/v1/apars?withInspection=true`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        if (response.ok) {
          const data = await response.json();
          setAparsData(data.data)
          const countByAparType: Record<string, { trueCount: number; falseCount: number; amount:number }> = {};
          const countByAparLocation: Record<string, { already_check6Monthly: number; need_check6Monthly: number; already_check1Monthly: number; need_check1Monthly: number; working_apar:number; fix_apar:number; amount:number }> = {};
          
          data.data.forEach((apar: {condition: boolean, apar_type: string, location: {location_name: string}, last_6montly_check_time: string, last_1montly_check_time: string}) => {
            const { condition, apar_type: aparType, location: { location_name }, last_6montly_check_time, last_1montly_check_time } = apar;
          
            countByAparType[aparType] = countByAparType[aparType] || { trueCount: 0, falseCount: 0, amount: 0 };
            countByAparLocation[location_name] = countByAparLocation[location_name] || { already_check6Monthly: 0, need_check6Monthly: 0, already_check1Monthly: 0, need_check1Monthly: 0, working_apar:0, fix_apar:0, amount:0 };
          
            condition ? countByAparType[aparType].trueCount++ : countByAparType[aparType].falseCount++;

            differenceInDays(last_6montly_check_time) > 175 ? countByAparLocation[location_name].need_check6Monthly++ : countByAparLocation[location_name].already_check6Monthly++;
            differenceInDays(last_1montly_check_time) > 30 ? countByAparLocation[location_name].need_check1Monthly++ : countByAparLocation[location_name].already_check1Monthly++;
            
            condition ? countByAparLocation[location_name].working_apar++ : countByAparLocation[location_name].fix_apar++;
          
            countByAparType[aparType].amount++;
            countByAparLocation[location_name].amount++;
          });

          
          setAparTrue(data.data.filter((apar: {condition: boolean}) => apar.condition === true).length)
          setAparFalse(data.data.filter((apar: {condition: boolean}) => apar.condition === false).length)
          setAparType(countByAparType)
          setRecordCheck(Object.entries(countByAparLocation).map(([location_name, { already_check6Monthly, need_check6Monthly, already_check1Monthly, need_check1Monthly, working_apar, fix_apar, amount }]) => ({
            location_name,
            total: amount,
            already_check6Monthly,
            need_check6Monthly,
            already_check1Monthly,
            need_check1Monthly,
            working_apar,
            fix_apar
          })))
          setLoading(false);
        } else {
          console.error('Error fetching Apar data:', response.status);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Row className='px-3 pb-3'>
      <Card className='col-12 bg-light my-2 px-4 py-2'><h1>Dashboard</h1></Card>
      {loading ?
              <div className="col-12 pb-5 mb-5 align-self-center text-center">
                  <Spinner animation="border" variant="success" />
              </div> :
               <>
                <div className='dognhnoutChart col-12 col-md-6 col-lg-4'>
                  <div className='m-1'>
                    <Card className='my-2'>
                      <Card.Header style={{ display: 'flex', justifyContent: 'space-between', borderTop: "2px #232931 solid" }}>
                        <div className='text-center justify-center align-self-center'>Jumlah APAR</div>
                        <ExportToExcelButton data={aparsData.map(item => formatObject(item))} fileName="Data-Apar" />
                      </Card.Header>
                      <Card.Body><Doughnut data={dataDognhnoutChart} /></Card.Body>
                      <p className='mx-3'> Jumlah Total APAR : {aparTrue + aparFalse}</p>
                    </Card>
                  </div>
              </div>
              <div className='barChart col-12 col-md-6 col-lg-8'>
                <div className='m-1'>
                  <Card>
                    <Card.Header style={{ display: 'flex', justifyContent: 'space-between', borderTop: "2px #232931 solid" }}>Jenis APAR</Card.Header>
                    <Card.Body><Bar options={options} data={data} /></Card.Body>
                  </Card>
                </div>
              </div>
              <div className='locationStatistic col-12'>
                  <div className='m-1'>
                    <Card className='my-2'>
                    <Card.Header style={{ display: 'flex', justifyContent: 'space-between', borderTop: "2px #232931 solid" }}>
                        <div className='text-center justify-center align-self-center'>Lokasi APAR</div>
                        <ExportToExcelButton data={recordCheck} fileName="Ringkasan-Data-Apar" />
                      </Card.Header>
                      <Card.Body>
                        <DataTable
                          columns={locationStatistic}
                          data={recordCheck}
                          fixedHeader
                          pagination
                          paginationRowsPerPageOptions={[5]}/>
                      </Card.Body>
                    </Card>
                  </div>
              </div>
               </>}
    </Row>
  )
};

export default DashboardContent;
