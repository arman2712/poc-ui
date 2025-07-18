import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Snackbar, Alert } from '@mui/material';
import { MenuItem } from '@mui/material';

function App() {
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [identificationForm, setIdentificationForm] = useState({
    userInfo: {
      firstName: '',
      middleName: '',
      lastName: '',
      curp: '',
      rfc: ''
    },
    address: {
      street: '',
      zipCode: '',
      externalNumber: '',
      internalNumber: '',
      state: '',
      province: '',
      neighborhood: ''
    }
  });
  const [errorForm, setErrorForm] = useState({
    userInfo: {
      firstName: 'Required',
      middleName: 'Required',
      lastName: '',
      curp: 'Required',
      rfc: 'Required'
    },
    address: {
      street: 'Required',
      zipCode: 'Required',
      externalNumber: 'Required',
      internalNumber: '',
      state: 'Required',
      province: 'Required',
      neighborhood: 'Required'
    }
  });

  const [form, setForm] = useState({
    name: '',
    website: '',
    email: ''
  });
  const [loadingForm, setLoadingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    axios
      .get('https://jsonplaceholder.typicode.com/users')
      .then((response) => {
        const users = response.data.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          website: user.website,
          geo: user.address.geo,
        }));
        setData(users);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleEditClick = (row) => {
    setSelectedRow(row.id);
    setForm({
      name: row.name,
      website: row.website,
      email: row.email,
      geo: row.geo,
    });
  };

  const handleDeleteClick = (id) => {
    setData((prev) => prev.filter((row) => row.id !== id));
    if (selectedRow === id) {
      setSelectedRow(null);
    }
  };

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setData((prev) =>
      prev.map((row) =>
        row.id === selectedRow ? { ...row, ...form } : row
      )
    );
    setSelectedRow(null);
  };

  // Sort data by ID
  const sortedData = [...data].sort((a, b) =>
    sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  );

  const handleSubmit = async () => {
    setLoadingForm(true); // Start spinner
    try {
      const response = await axios.post('http://httpbin.org/post', identificationForm);
      setSnackbar({
        open: true,
        message: 'User submitted successfully!',
        severity: 'success',
      });
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error sending identification form:', error);
      setSnackbar({
        open: true,
        message: 'Error sending identification form.',
        severity: 'error',
      });
    } finally {
      setLoadingForm(false); // Stop spinner
    }
  };

  const hasAnyError = (obj) => {
    return Object.values(obj).some((val) => {
      if (typeof val === 'object' && val !== null) {
        return hasAnyError(val); // recursively check nested objects
      }
      return val !== ''; // if any field is not empty then has error
    });
  };

  const isValidFieldWithLetters = (value) => {
    return /^[a-zA-Z]+$/.test(value);
  };
  const isValidCurp = (curp) => {
    // generic validation for CURP format
    const regex = /^[A-Z][AEIOU][A-Z]{2}\d{6}[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;
    return regex.test(curp.toUpperCase());
  };
  const isValidRfc = (rfc) => {
    // Define the regex pattern for RFC format (no access to the date of birth)
    const regexRFC = /^([A-ZÑ&]{3,4})\d{6}(?:[A-Z\d]{3})?$/;
    return regexRFC.test(rfc.toUpperCase());
  };
  const isOnlySmallNumbers = (value) => {
    return /^[0-9]{1,5}$/.test(value);
  };

  const states = [
    { code: 'CH', name: 'Chihuahua' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'NL', name: 'Nuevo Leon' },
    { code: 'SLP', name: 'San Luis Potosi' },
    { code: 'SON', name: 'Sonora' },
    { code: 'TAMPS', name: 'Tamaulipas' },
    { code: 'ZAC', name: 'Zacatecas' },
    { code: 'COAH', name: 'Coahuila' },
    { code: 'GTO', name: 'Guanajuato' },
    { code: 'JAL', name: 'Jalisco' },
    { code: 'MEX', name: 'Mexico' },
    { code: 'MOR', name: 'Morelos' },
    { code: 'NAY', name: 'Nayarit' },
    { code: 'OAX', name: 'Oaxaca' },
    { code: 'PUE', name: 'Puebla' },
    { code: 'QRO', name: 'Queretaro' },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        User Data
      </Typography>
      <Box component={Paper} mb={4} p={3}>
        <Typography variant="h4" gutterBottom>Identificacion</Typography>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="row" gap={2} maxWidth="800px">
            <TextField
              size='small'
              required
              label="Nombre"
              value={identificationForm.userInfo.firstName}
              error={Boolean(errorForm.userInfo.firstName)}
              helperText={errorForm.userInfo.firstName}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    firstName: value,
                  },
                }));
                const isValid = isValidFieldWithLetters(value);
                const errorMessage = value.trim() === '' ? 'Required' : isValid ? '' : 'Only letters are allowed';
                setErrorForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    firstName: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              required
              label="Primer Apellido"
              value={identificationForm.userInfo.middleName}
              error={Boolean(errorForm.userInfo.middleName)}
              helperText={errorForm.userInfo.middleName}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    middleName: value,
                  },
                }));
                const isValid = isValidFieldWithLetters(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Only letters are allowed';
                setErrorForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    middleName: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              label="Segundo Apellido"
              value={identificationForm.userInfo.lastName}
              error={Boolean(errorForm.userInfo.lastName)}
              helperText={errorForm.userInfo.lastName}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    lastName: value,
                  },
                }));
                const isValid = isValidFieldWithLetters(value);
                const errorMessage = isValid ? '' : 'Only letters are allowed';
                setErrorForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    lastName: errorMessage,
                  }
                }));
              }}
            />
          </Box>
          <br />
          <Box display="flex" flexDirection="row" gap={2} maxWidth="800px">
            <TextField
              size='small'
              required
              label="CURP"
              value={identificationForm.userInfo.curp}
              error={Boolean(errorForm.userInfo.curp)}
              helperText={errorForm.userInfo.curp}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    curp: value,
                  },
                }));
                const isValid = isValidCurp(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Invalid CURP';
                setErrorForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    curp: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              required
              label="RFC"
              value={identificationForm.userInfo.rfc}
              error={Boolean(errorForm.userInfo.rfc)}
              helperText={errorForm.userInfo.rfc}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    rfc: value,
                  },
                }));
                const isValid = isValidRfc(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Invalid RFC';
                setErrorForm((prev) => ({
                  ...prev,
                  userInfo: {
                    ...prev.userInfo,
                    rfc: errorMessage,
                  }
                }));
              }}
            />
          </Box>
          <br />
          <Box display="flex" flexDirection="row" gap={2} maxWidth="800px">
            <TextField
              size='small'
              required
              label="Postal Code"
              value={identificationForm.address.zipCode}
              error={Boolean(errorForm.address.zipCode)}
              helperText={errorForm.address.zipCode}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    zipCode: value,
                  },
                }));
                const isValid = isOnlySmallNumbers(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Only numbers are allowed less than 5 digits';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    zipCode: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              required
              label="Street"
              value={identificationForm.address.street}
              error={Boolean(errorForm.address.street)}
              helperText={errorForm.address.street}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    street: value,
                  },
                }));
                const errorMessage = value.trim() == '' ? 'Required' : '';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    street: errorMessage,
                  }
                }));
              }}
            />
          </Box>
          <br />
          <Box display="flex" flexDirection="row" gap={2} maxWidth="800px">
            <TextField
              size='small'
              required
              label="External Number"
              value={identificationForm.address.externalNumber}
              error={Boolean(errorForm.address.externalNumber)}
              helperText={errorForm.address.externalNumber}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    externalNumber: value,
                  },
                }));
                const isValid = isOnlySmallNumbers(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Only numbers are allowed less than 5 digits';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    externalNumber: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              label="Internal Number"
              value={identificationForm.address.internalNumber}
              error={Boolean(errorForm.address.internalNumber)}
              helperText={errorForm.address.internalNumber}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    internalNumber: value,
                  },
                }));
                const isValid = /^[a-zA-Z0-9]{1,10}$/.test(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Only numbers and letters are allowed less than 10 characters';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    internalNumber: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              select
              label="State"
              value={identificationForm.address.state}
              error={Boolean(errorForm.address.state)}
              helperText={errorForm.address.state}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    state: value,
                  },
                }));
                const errorMessage = value.trim() == '' ? 'Required' : '';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    state: errorMessage,
                  }
                }));
              }}
              required
            >
              {states.map((state) => (
                <MenuItem key={state.code} value={state.code}>
                  {state.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <br />
          <Box display="flex" flexDirection="row" gap={2} maxWidth="800px">
            <TextField
              size='small'
              required
              label="Province"
              value={identificationForm.address.province}
              error={Boolean(errorForm.address.province)}
              helperText={errorForm.address.province}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    province: value,
                  },
                }));
                const isValid = isValidFieldWithLetters(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Only letters are allowed';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    province: errorMessage,
                  }
                }));
              }}
            />
            <TextField
              size='small'
              required
              label="Neighborhood"
              value={identificationForm.address.neighborhood}
              error={Boolean(errorForm.address.neighborhood)}
              helperText={errorForm.address.neighborhood}
              onChange={(e) => {
                const value = e.target.value;
                setIdentificationForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    neighborhood: value,
                  },
                }));
                const isValid = isValidFieldWithLetters(value);
                const errorMessage = value.trim() == '' ? 'Required' : isValid ? '' : 'Only letters are allowed';
                setErrorForm((prev) => ({
                  ...prev,
                  address: {
                    ...prev.address,
                    neighborhood: errorMessage,
                  }
                }));
              }}
            />
          </Box>
          <br />
          <Button
            size='small'
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            disabled={hasAnyError(errorForm) || loadingForm}
            startIcon={loadingForm ? <CircularProgress size={20} /> : null}
          >
            {loadingForm ? 'Submitting...' : 'Save'}
          </Button>
        </form>
      </Box>

      {selectedRow && (
        <Box component={Paper} mb={4} p={3}>
          <Typography variant="h6" gutterBottom>Edit User</Typography>
          <Box display="flex" flexDirection="column" gap={2} maxWidth="400px">
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
            />
            <TextField
              label="Website"
              name="website"
              value={form.website}
              onChange={handleInputChange}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
            />
            {form.geo && (
              <MapContainer
                center={[parseFloat(form.geo.lat), parseFloat(form.geo.lng)]}
                zoom={5}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[parseFloat(form.geo.lat), parseFloat(form.geo.lng)]}>
                  <Popup>
                    {form.name}'s location
                  </Popup>
                </Marker>
              </MapContainer>
            )}
            <Button variant="contained" onClick={handleSave} disabled>
              Save
            </Button>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box mt={4} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ID {sortOrder === 'asc' ? '▲' : '▼'}
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Website</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    backgroundColor: selectedRow === row.id ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                  }}
                >
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.website}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(row)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(row.id)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>

  );
}

export default App;
