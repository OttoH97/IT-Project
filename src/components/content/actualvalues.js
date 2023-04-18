import React from "react";
import axios from "axios";

const ActualValuesComponent = ({ weldId }) => {
  const [actualValues, setActualValues] = React.useState([]);
  const [sectionDetails, setSectionDetails] = React.useState([]);

  const handleToggle = (weldId) => {
    axios
      .get(`http://localhost:4000/welds/${weldId}/Sections`)
      .then((response) => {
        setActualValues(response.data.ActualValues);
        setSectionDetails(response.data.SectionDetails);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <h1>Actual Values</h1>
      <button onClick={() => handleToggle(weldId)}>Fetch Actual Values</button>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Unit</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {actualValues.map((actualValue) => {
            const { Timestamp, Values } = actualValue;
            const qMasterLimitValue =
              sectionDetails[0]?.QMaster?.QMasterLimitValueList[0];

            if (qMasterLimitValue) {
              const max = qMasterLimitValue.CommandValue + qMasterLimitValue.UpperLimitValue;
              const min = qMasterLimitValue.CommandValue - qMasterLimitValue.LowerLimitValue;

              return Values.map((value, index) => {
                const isMaxViolation = value > max;
                const isMinViolation = value < min;

                return (
                  <tr
                    key={`${Timestamp}_${index}`}
                    style={{ color: isMaxViolation || isMinViolation ? "red" : "inherit" }}
                  >
                    <td>{Timestamp}</td>
                    <td>{qMasterLimitValue.Unit}</td>
                    <td>{value}</td>
                  </tr>
                );
              });
            } else {
              return null;
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ActualValuesComponent;