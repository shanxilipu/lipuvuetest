import React from 'react';
import { Form, Col, Select, Input } from 'antd';
import { formatMessage } from 'umi/locale';
import EntitiesModal from './EntitiesModal';
import { getAllCatalogues, getDataCycle } from '../services';
import { defaultHandleResponse } from '@/utils/utils';

class CommonTableInfo extends React.Component {
  catalogues = [];

  state = {
    layers: [],
    domains: [],
    cycles: [],
    showBusinessModal: false,
    businessName: '',
    loadingCatalogues: false,
    loadingDataCycles: false,
  };

  entityModalProps = {
    onConfirm: selectedRow => {
      this.toggleBusinessModal();
      const { businessId, wordCnName, wordEnName, columnId } = selectedRow;
      const { handleSelectEntity } = this.props;
      if (handleSelectEntity) {
        handleSelectEntity({ businessName: wordCnName, columnCode: wordEnName, columnId });
      }
      this.setState({ businessName: wordCnName });
      this.setBusinessId(businessId);
    },
    onCancel: () => {
      this.toggleBusinessModal();
    },
  };

  componentDidMount() {
    const { tableInfo } = this.props;
    this.resetBusinessInfo(tableInfo || {});
    this.getAllCatalogues();
    this.getDataCycles();
  }

  componentWillReceiveProps(nextProps) {
    const { currentTableMark: nextCurrentTableMark, tableInfo: nextTableInfo } = nextProps;
    const { currentTableMark } = this.props;
    if (!nextTableInfo && nextCurrentTableMark !== currentTableMark) {
      this.setState({ businessName: '' });
      return false;
    }
    if (nextTableInfo && nextCurrentTableMark !== currentTableMark) {
      this.resetBusinessInfo(nextTableInfo || {});
      this.resetDomains(nextProps);
    }
  }

  componentDidUpdate() {}

  setBusinessId = businessId => {
    const { setBusinessId } = this.props;
    setBusinessId(businessId);
  };

  resetBusinessInfo = tableInfo => {
    const { businessName = '', businessId = null } = tableInfo;
    this.setState({ businessName });
    this.setBusinessId(businessId);
  };

  resetDomains = props => {
    const { tableInfo } = props;
    if (!tableInfo) {
      return false;
    }
    const { layerId } = tableInfo;
    let domains = [];
    const layers = this.catalogues.filter(cata => cata.cataType === '2');
    if (layerId) {
      let layerTreeId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].cataId === layerId) {
          layerTreeId = layers[i].id;
          break;
        }
      }
      domains = this.catalogues.filter(
        cata => cata.cataType === '3' && cata.parentId === layerTreeId
      );
    }
    this.setState({
      domains,
    });
  };

  getAllCatalogues = () => {
    this.setState({ loadingCatalogues: true });
    getAllCatalogues().then(result => {
      this.setState({ loadingCatalogues: false });
      defaultHandleResponse(result, (resultObject = []) => {
        this.catalogues = resultObject.slice();
        const layers = resultObject.filter(cata => cata.cataType === '2');
        this.setState({
          layers,
        });
        this.resetDomains(this.props);
      });
    });
  };

  getDataCycles = () => {
    this.setState({ loadingDataCycles: true });
    getDataCycle().then(result => {
      this.setState({ loadingDataCycles: false });
      defaultHandleResponse(result, (cycles = []) => {
        this.setState({ cycles });
      });
    });
  };

  toggleBusinessModal = () => {
    const { showBusinessModal } = this.state;
    this.setState({ showBusinessModal: !showBusinessModal });
  };

  render() {
    const { editable, getFieldDecorator, getInitValue, colLayout, COMMONRule } = this.props;
    const {
      layers,
      domains,
      cycles,
      showBusinessModal,
      businessName,
      loadingCatalogues,
      loadingDataCycles,
    } = this.state;
    return (
      <div>
        {showBusinessModal && (
          <EntitiesModal {...this.entityModalProps} visible={showBusinessModal} />
        )}
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'DATA_LAYER' })}>
            {getFieldDecorator('layerId', {
              initialValue: getInitValue('layerId') || undefined,
              rules: [COMMONRule],
            })(
              <Select
                loading={loadingCatalogues}
                placeholder={formatMessage({ id: 'DATA_LAYER' })}
                disabled={!editable}
                onChange={layerId => {
                  this.resetDomains({ tableInfo: { layerId } });
                }}
              >
                {layers.map(layer => (
                  <Select.Option key={layer.cataId} value={layer.cataId}>
                    {layer.cataName}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'DATA_DOMAIN' })}>
            {getFieldDecorator('domainId', {
              initialValue: getInitValue('domainId') || undefined,
              rules: [COMMONRule],
            })(
              <Select
                placeholder={formatMessage({ id: 'DATA_DOMAIN' })}
                disabled={!editable}
                loading={loadingCatalogues}
              >
                {domains.map(domain => (
                  <Select.Option key={domain.cataId} value={domain.cataId}>
                    {domain.cataName}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'ENTITY' })}>
            {getFieldDecorator('businessId', {
              initialValue: businessName,
            })(
              <Input
                autoComplete="off"
                placeholder={formatMessage({ id: 'ENTITY' })}
                onClick={this.toggleBusinessModal}
                disabled={!editable}
              />
            )}
          </Form.Item>
        </Col>
        <Col {...colLayout}>
          <Form.Item label={formatMessage({ id: 'DATA_CYCLE' })}>
            {getFieldDecorator('dataCycle', {
              initialValue: getInitValue('dataCycle') || undefined,
              rules: [COMMONRule],
            })(
              <Select
                loading={loadingDataCycles}
                placeholder={formatMessage({ id: 'DATA_CYCLE' })}
                disabled={!editable}
              >
                {cycles.map(cycle => (
                  <Select.Option key={cycle.id} value={cycle.dataCycleCode}>
                    {cycle.dataCycleName}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
      </div>
    );
  }
}
export default CommonTableInfo;
